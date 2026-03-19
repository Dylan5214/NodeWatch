from collections import deque
import time

WINDOW = 10 # Number of readings to analyze

class TrendAnalyzer:
    def __init__(self):
        self._windows: dict[str, deque] = {}

    def update(self, sensor_id: str, value: float, timestamp: float):
        if sensor_id not in self._windows:
            self._windows[sensor_id] = deque(maxlen=WINDOW)
        self._windows[sensor_id].append((timestamp, value))
        
    def analyze(self, sensor_id: str, critical_threshold: float) -> dict:
        window = self._windows.get(sensor_id)
        if not window or len(window) < 3:
            return {"trend": "stable", "eta_to_critical": None}
        
        times = [p[0] for p in window]
        values = [p[1] for p in window]

        slope = _linear_slope(times, values)

        if(slope > 0.5):
            trend = "rising"
        elif slope < -0.5:
            trend = "falling"
        else:
            trend = "stable"
        
        eta = None
        latest_value = values[-1]
        if slope > 0 and latest_value < critical_threshold:
            gap = critical_threshold - latest_value
            eta = round(gap/slope)

        return {"trend": trend, "eta_to_critical": eta}
    

def _linear_slope(xs: list, ys: list) -> float:
    n = len(xs)
    x_mean = sum(xs) / n
    y_mean = sum(ys) / n
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys))
    denominator = sum((x - x_mean) ** 2 for x in xs)
    return numerator / denominator if denominator != 0 else 0.0
