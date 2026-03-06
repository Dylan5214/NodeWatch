import asyncio
import json
import time
from collections import deque
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from backend.sensors import CPUTemperatureSensor, MemoryUsageSensor, CoolingFanSensor, NetworkThroughputSensor
# Creats web server instance
app = FastAPI(title = "NodeWatch API")

# CORS Middleware allowing all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"]
)
# Initialize Sensor Registry
SENSORS = [
    CPUTemperatureSensor("CPU-01", "Rack A - CPU"),
    MemoryUsageSensor("MEM-01", "Rack A - Memory"),
    CoolingFanSensor("FAN-01", "Rack A - Fan"),
    NetworkThroughputSensor("NET-01", "Rack A - Network"),
]

latest_readings = {}
alert_log = deque(maxlen = 100)
#Dict to convert object to different format for json dumps
def reading_to_dict(reading) -> dict:
    return {
        "computer_id": reading.computer_id,
        "sensor_type": reading.sensor_type,
        "value": reading.value,
        "unit": reading.unit,
        "status": reading.status,
        "timestamp": reading.timestamp,
    }

# Calles read on everysensor, updating latest readings
# Adds dictionary formatted outcome to results 
def poll_sensors() -> list[dict]:
    results = []
    for sensor in SENSORS:
        reading = sensor.read()
        d = reading_to_dict(reading)
        latest_readings[reading.computer_id] = d
        if reading.status in ("warning", "critical"):
            alert_log.append(d)
        results.append(d)
    return results

# SSE endpoint
# Using async since connection remains open
@app.get("/stream")
async def stream():
    async def event_gen():
        while True:
            readings = poll_sensors()
            package = json.dumps(readings)
            yield f"data: {package}\n\n"
            await asyncio.sleep(2)
        
    return StreamingResponse(
        event_gen(),
        media_type = "text/event-stream", #Tells its SSE
        headers = {
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

# REST endpoints

@app.get("/sensors")
def get_sensors():
    return list(latest_readings.values())


@app.get("/alerts")
def get_alerts():
    return list(alert_log)


@app.get("/health")
def health():
    return {"status": "ok", "timestamp": time.time()}