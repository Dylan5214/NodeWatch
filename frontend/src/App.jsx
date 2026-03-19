import { useState, useEffect } from "react"
import Charts from "./Charts"

function App() {
  const [page, setPage] = useState("dashboard")
  const [sensors, setSensors] = useState([])
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)
  const [history, setHistory] = useState({})


  useEffect(() => {
    const es = new EventSource("http://localhost:8000/stream")
  
    es.onopen = () => setConnected(true)
  
    es.onmessage = (e) => {
      setConnected(true)
      const data = JSON.parse(e.data)
      setSensors(data)
      setHistory(prev => {
        const updated = { ...prev }
        data.forEach(sensor => {
          const key = sensor.computer_id
          const prev_readings = updated[key] || []
          updated[key] = [...prev_readings, {
            time: new Date(sensor.timestamp * 1000).toLocaleTimeString(),
            value: sensor.value
          }].slice(-20) // keep last 20 readings
        })
        return updated
      })
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
    <>
      <div className="header">
        <h1>NodeWatch</h1>
        <span className={`connection-status ${connected ? "online" : "offline"}`}>
          {connected ? "● LIVE" : "● DISCONNECTED"}
        </span>
        <nav className="tabs">
          <button className={`tab ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>
            Dashboard
          </button>
          <button className={`tab ${page === "charts" ? "active" : ""}`} onClick={() => setPage("charts")}>
            Charts
          </button>
        </nav>
      </div>
      {page === "dashboard" ? (
        <>
          <div className="sensor-grid">
            {sensors.map(sensor => (
              <div key={sensor.computer_id} className={`sensor-card ${sensor.status}`}>
                <h2>{sensorDisplay[sensor.sensor_type]?.icon} {sensorDisplay[sensor.sensor_type]?.label}</h2>
                <p className="sensor-id">{sensor.computer_id}</p>
                <p className="sensor-value">
                  {sensor.value} {sensor.unit}
                  <span className={`trend-arrow trend-${sensor.trend}`}>
                    {sensor.trend === "rising" ? " ↑" : sensor.trend === "falling" ? " ↓" : " →"}
                  </span>
                </p>
                {sensor.eta_to_critical && (
                  <p className="eta-badge">⚠ critical in ~{sensor.eta_to_critical}s</p>
                )}
                {sensor.status !== "normal" && (
                  <p className="sensor-status">{sensor.status}</p>
                )}
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
                  <span>{alert.value} {alert.unit}</span>
                  <span className="alert-badge">{alert.status.toUpperCase()}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <Charts sensors={sensors} history={history} />
      )}
    </>
  )
}

export default App