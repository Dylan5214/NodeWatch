import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const sensorDisplay = {
  CPUTemperatureSensor:    { label: "CPU Temperature", color: "#00ff99" },
  MemoryUsageSensor:       { label: "Memory Usage",    color: "#60a5fa" },
  CoolingFanSensor:        { label: "Cooling Fan",     color: "#a78bfa" },
  NetworkThroughputSensor: { label: "Network",         color: "#f59e0b" },
}

function Charts({ sensors, history }) {
  return (
    <div className="charts-grid">
      {sensors.map(sensor => {
        const display = sensorDisplay[sensor.sensor_type]
        const data = history[sensor.computer_id] || []

        return (
          <div key={sensor.computer_id} className="chart-card">
            <h2>{display?.label}</h2>
            <p className="sensor-id">{sensor.computer_id}</p>
            <p className="chart-current" style={{ color: display?.color }}>
              {sensor.value} {sensor.unit}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <XAxis dataKey="time" hide />
                <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(v) => `${v}${sensor.unit}`}
                    width={40}
                />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #1f2937", fontSize: "0.75rem" }}
                  labelStyle={{ color: "#6b7280" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={display?.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}

export default Charts