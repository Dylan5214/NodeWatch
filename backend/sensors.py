import random
import time
from dataclasses import dataclass

# Simulate sensor data coming from computers in the network

@dataclass #Auto generate SensorReading innit
class SensorReading:
    computer_id: str # Unique ID ("CPU-001", "GPU-002", etc.)
    sensor_type: str # Type of sensor
    value: float # Sensor reading value
    unit: str # Unit of measurement (°C, %, etc.)
    status: str # Status of reading ("normal", "warning", etc.)
    timestamp: float # Time of reading (epoch time)

# Sensor Class containing all logic shared between sensors
class Sensor:
    # Initialize sensor with id and ranges
    # name represents human readable name
    def __init__(self, computer_id: str, name: str, unit: str,
                 normal_range: tuple, warning_range: tuple, critical_range: tuple):
        self.computer_id = computer_id
        self.name = name
        self.unit = unit
        self.normal_range = normal_range
        self.warning_range = warning_range
        self.critical_range = critical_range

        # Start sensor at value within range
        self._current_value = random.uniform(*self.normal_range)

    def _generate_value(self) -> float:
        # Generate random number to decide if normal, warning,
        # or critical reading.

        roll = random.random()
        if roll < 0.85:
            target = random.uniform(*self.normal_range)
        elif roll < 0.95:
            target = random.uniform(*self.warning_range)
        else:
            target = random.uniform(*self.critical_range)

        # Make changes occur gradually for realism using linear
        # Interpolation
        self._current_value += (target - self._current_value) * 0.3 # Value determins speed of sensor changes
        return round(self._current_value, 2)
    
    def _get_status(self, value: float) -> str:
        if(self.critical_range[0] <= value <= self.critical_range[1]):
            return "critical"
        elif self.warning_range[0] <= value <= self.warning_range[1]:
            return "warning"
        return "normal"
    
    def read(self) -> SensorReading:
        # Fuction called by app to recieve reading
        # Generate value, determines status, returns SensorReading
        value = self._generate_value()
        return SensorReading(
            computer_id = self.computer_id,
            sensor_type = self.__class__.__name__, # gets subclass name
            value = value,
            unit = self.unit,
            status = self._get_status(value),
            timestamp = time.time()
        )

# -------------------------------------------
# Classes for specific sensor types present in Data Centers
# -------------------------------------------

class CPUTemperatureSensor(Sensor):
    def __init__(self, computer_id: str, name: str):
        super().__init__( # pass to parent class
            computer_id = computer_id,
            name = name,
            unit = "C",
            normal_range = (35, 65),    # Healthy operating temp
            warning_range = (66, 80),   # Getting hot
            critical_range = (81, 100)  # Sutdown risk
        )

class MemoryUsageSensor(Sensor):
    def __init__(self, computer_id: str, name: str):
        super().__init__(
            computer_id = computer_id,
            name = name,
            unit = "%",
            normal_range = (20, 70),
            warning_range = (71, 88),
            critical_range = (89, 100)
        )
    
class NetworkThroughputSensor(Sensor):
    def __init__(self, computer_id: str, name: str):
        super().__init__(
            computer_id = computer_id,
            name = name,
            unit = "Mbps",
            normal_range = (100, 700),
            warning_range = (701, 900),
            critical_range = (901, 1000)
        )

class CoolingFanSensor(Sensor):
    def __init__(self, computer_id: str, name: str):
        super().__init__(
            computer_id = computer_id,
            name = name,
            unit = "RPM",
            normal_range = (1000, 3000),
            warning_range = (3001, 4000),
            critical_range = (4001, 5000) 
        )
