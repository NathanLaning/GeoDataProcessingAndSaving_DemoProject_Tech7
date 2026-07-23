import {  useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
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
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production'

type Records = {
  locations: LocationRecord[]
  ecef: EcefRecord[]
}
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

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <UI />
    </QueryClientProvider>
  )
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
  const seconds = String(value.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function UI() {
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return formatDateTimeInput(date)
  })
  const [endDate, setEndDate] = useState(() => formatDateTimeInput(new Date()))
  const [dataLimit, setDataLimit] = useState(100)

  const loadData = async (): Promise<Records> => {
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

      const payload = (await response.json()) as Records
      setError('')
      return payload
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unknown error'
      setError(message)
      throw caughtError
    }
  }

  const locationData = useQuery({
    queryKey: ['locationQuery', startDate, endDate, dataLimit],
    queryFn: loadData,
  })

  const ecefSeries = useMemo(
    () =>
      (locationData.data?.ecef ?? [])
        .slice()
        .reverse()
        .map((item) => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          x: item.x_coordinate,
          y: item.y_coordinate,
          z: item.z_coordinate,
          device: item.device_uuid,
        })),
    [locationData.data],
  )

  const locationPoints = useMemo(
    () =>
      (locationData.data?.locations ?? [])
        .slice()
        .reverse()
        .map((item) => {
          const parsed = parseLocationPoint(item.geography_position)

          return {
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            latitude: parsed?.latitude ?? 0,
            longitude: parsed?.longitude ?? 0,
          }
        }),
    [locationData.data],
  )

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="panel-header">
          <div>
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
                  <Line type="monotone" dataKey="x" stroke="#f79a38" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="y" stroke="#02d9ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="z" stroke="#00f9a6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
          </div>
          <div className="dashboard-grid">
          <article className="chart-card">
            <h2>Location trend</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={locationPoints} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="latitude" stroke="#f79a38" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="longitude" stroke="#02d9ff" strokeWidth={2} dot={false} />
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