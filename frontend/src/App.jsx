import { useState, useEffect } from "react"

function App() {
  const [sensors, setSensors] = useState([])
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)


  useEffect(() => {
    const es = new EventSource("http://localhost:8000/stream")
  
    es.onopen = () => setConnected(true)
  
    es.onmessage = (e) => {
      setConnected(true)
      setSensors(JSON.parse(e.data))
    }
  
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setConnected(false)
      }
    }
  
    const fetchAlerts = () => {
      fetch("http://localhost:8000/alerts")
        .then(res => res.json())
        .then(data => setAlerts(data))
    }
  
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 2000)
  
    return () => {
      es.close()
      clearInterval(interval)
    }
  }, [])

  const sensorDisplay = {
    CPUTemperatureSensor:      { label: "CPU Temperature", icon: "🖥️" },
    MemoryUsageSensor:         { label: "Memory Usage",    icon: "💾" },
    CoolingFanSensor:          { label: "Cooling Fan",     icon: "🌀" },
    NetworkThroughputSensor:   { label: "Network",         icon: "📡" },
  }

  return (
    <div className="dashboard">
      <h1>NodeWatch</h1>
        <span className={`connection-status ${connected ? "online" : "offline"}`}>
          {connected ? "● LIVE" : "● DISCONNECTED"}
        </span>
      <div className="sensor-grid">
        {sensors.map(sensor => (
          <div key={sensor.computer_id} className={`sensor-card ${sensor.status}`}>
            <h2>{sensorDisplay[sensor.sensor_type]?.icon} {sensorDisplay[sensor.sensor_type]?.label}</h2>
            <p className="sensor-id">{sensor.computer_id}</p>
            <p className="sensor-value">{sensor.value} {sensor.unit}</p>
            <p className="sensor-status">{sensor.status}</p>
          </div>
        ))}
      </div>
      <div className="alert-log">
        <h2>Alert Log</h2>
          {alerts.length === 0 ? (
          <p className="no-alerts">No alerts</p>
        ) : (
          [...alerts].reverse().map((alert, i) => (
            <div key={i} className={`alert-item ${alert.status}`}>
              <span>{new Date(alert.timestamp * 1000).toLocaleTimeString()}</span>
              <span>{sensorDisplay[alert.sensor_type]?.label ?? alert.computer_id}</span>
              <span>{alert.value}{alert.unit}</span>
              <span className="alert-badge">{alert.status.toUpperCase()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App