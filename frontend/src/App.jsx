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
    <pre>{JSON.stringify(sensors, null, 2)}</pre>
    </div>
  )
}

export default App