from backend.sensors import CPUTemperatureSensor, MemoryUsageSensor, CoolingFanSensor

cpu = CPUTemperatureSensor("CPU-01","Rack A - CPU")
mem = MemoryUsageSensor("MEM-01", "Rack A - Memory")
fan = CoolingFanSensor("FAN-01", "Rack A - Fan")

for _ in range(5):
    for sensor in [cpu, mem, fan]:
        reading = sensor.read()
        print(f"{reading.computer_id} | {reading.sensor_type} | {reading.value}{reading.unit} | {reading.status}")
    print("------------")