import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

type LocationRecord = {
  timestamp: string
  geography_position: string
  device_uuid: string
}

type EcefRecord = {
  timestamp: string
  x_coordinate: number
  y_coordinate: number
  z_coordinate: number
  device_uuid: string
}

type ParsedLocationPoint = {
  timestamp: string
  device_uuid: string
  latitude: number
  longitude: number
}

const parseLocationPoint = (value: string): ParsedLocationPoint | null => {
  const cleanedValue = value.replace(/[a-zA-Z()]/g, ' ')
  const coordinates = cleanedValue
    .split(/\s+/)
    .map((entry) => Number.parseFloat(entry))
    .filter((entry) => !Number.isNaN(entry))

  if (coordinates.length < 2) {
    return null
  }

  return {
    timestamp: '',
    device_uuid: '',
    latitude: coordinates[0],
    longitude: coordinates[1],
  }
}

const formatDateTimeInput = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function App() {
  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [ecef, setEcef] = useState<EcefRecord[]>([])
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return formatDateTimeInput(date)
  })
  const [endDate, setEndDate] = useState(() => formatDateTimeInput(new Date()))
  const [dataLimit, setDataLimit] = useState(100)
  useEffect(() => {
    const loadData = async () => {
      try {
        const query = new URLSearchParams({
          limit: dataLimit.toString(),
          startDate,
          endDate,
        })

        const response = await fetch(`/api/recentData?${query.toString()}`)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = await response.json()
        setLocations(payload.locations ?? [])
        setEcef(payload.ecef ?? [])
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
      }
    }

    void loadData()
  }, [startDate, endDate, dataLimit])

  const ecefSeries = useMemo(
    () =>
      ecef
        .slice()
        .reverse()
        .map((item) => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          x: item.x_coordinate,
          y: item.y_coordinate,
          z: item.z_coordinate,
          device: item.device_uuid,
        })),
    [ecef],
  )

  const locationPoints = useMemo(
    () =>
      locations
        .map((item) => {
          const parsed = parseLocationPoint(item.geography_position)
          return parsed ? { ...parsed, timestamp: item.timestamp, device_uuid: item.device_uuid } : null
        })
        .filter((item): item is ParsedLocationPoint => item !== null),
    [locations],
  )

  const latestLocation = locationPoints.at(-1)

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Live telemetry</p>
            <h1>Geo Data Processing Dashboard</h1>
          </div>
          <div className="status-pill">{error ? 'Needs attention' : 'Streaming'}</div>
        </div>

        <p className="subtitle">Recent position and ECEF data are rendered as interactive charts.</p>

        <div className="range-controls">
          <label className="field-label">
            <span>Start date &amp; time</span>
            <input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="field-label">
            <span>End date &amp; time</span>
            <input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <label className="field-label">
            <span>Data Limit</span>
            <input type="number" value={dataLimit} onChange={(event) => setDataLimit(Number(event.target.value))} />
          </label>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="stats-grid">
          <article className="stat-card">
            <span>Total location records</span>
            <strong>{locations.length}</strong>
          </article>
          <article className="stat-card">
            <span>Total ECEF samples</span>
            <strong>{ecef.length}</strong>
          </article>
          <article className="stat-card">
            <span>Latest latitude</span>
            <strong>{latestLocation ? latestLocation.latitude.toFixed(4) : '—'}</strong>
          </article>
          <article className="stat-card">
            <span>Latest longitude</span>
            <strong>{latestLocation ? latestLocation.longitude.toFixed(4) : '—'}</strong>
          </article>
        </div>

        <div className="dashboard-grid">
          <article className="chart-card">
            <h2>ECEF coordinate trend</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ecefSeries} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="x" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="y" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="z" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
          </div>
      </section>
    </main>
  )
}

export default App
