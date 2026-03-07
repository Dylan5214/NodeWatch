import { useState, useEffect } from "react"

function App() {
  const [sensors, setSensors] = useState([])

  useEffect(() => {
    const es = new EventSource("http://localhost:8000/stream")
  
    es.onmessage = (e) => {
    setSensors(JSON.parse(e.data))
  }

  return () => es.close()
}, [])
  return (
    <div className="dashboard">
      <h1>NodeWatch</h1>
      <div className="sensor-grid">
        {sensors.map(sensor => (
          <div key={sensor.computer_id} className={`sensor-card ${sensor.status}`}>
            <h2>{sensor.sensor_type}</h2>
            <p className="sensor-id">{sensor.computer_id}</p>
            <p className="sensor-value">{sensor.value} {sensor.unit}</p>
            <p className="sensor-status">{sensor.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App