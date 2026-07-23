import {  useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { convertDateToTimeStampString } from './tools/tools'
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

import type { Records } from './types/Location'

function App() {
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return convertDateToTimeStampString(date)
  })
  const [endDate, setEndDate] = useState(() => convertDateToTimeStampString(new Date()))
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
const ecefSeriesDerivivative = useMemo(
    () =>
      (locationData.data?.ecef ?? [])
        .slice()
        .reverse()
        .map((item, index, array) => {
          if (index === 0) {
            return {
              timestamp: new Date(item.timestamp).toLocaleTimeString(),
              x: 0,
              y: 0,
              z: 0,
              average: 0,
              device: item.device_uuid,
            }
          }

          const previousItem = array[index - 1]
          const timeDifference = new Date(item.timestamp).getTime() - new Date(previousItem.timestamp).getTime()

          return {
            timestamp: new Date(item.timestamp).toLocaleTimeString(),
            x: (item.x_coordinate - previousItem.x_coordinate) / timeDifference,
            y: (item.y_coordinate - previousItem.y_coordinate) / timeDifference,
            z: (item.z_coordinate - previousItem.z_coordinate) / timeDifference,
            average: (item.x_coordinate + item.y_coordinate + item.z_coordinate) / (3 * timeDifference),
            device: item.device_uuid,
          }
        }),
    [locationData.data],
  )
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
          average: (item.x_coordinate + item.y_coordinate + item.z_coordinate) / 3,
          device: item.device_uuid,
        })),
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
            <span>Start date & time</span>
            <input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="field-label">
            <span>End date & time</span>
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
                  <XAxis dataKey="timestamp" scale="auto" />
                  <YAxis scale="auto" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="x" stroke="#f79a38" opacity={0.5} strokeWidth={3}  dot={true} />
                  <Line type="monotone" dataKey="y" stroke="#02d9ff" opacity={0.5} strokeWidth={3}  dot={true} />
                  <Line type="monotone" dataKey="z" stroke="#00f9a6" opacity={0.5} strokeWidth={3}  dot={true} />
                  <Line type="monotone" dataKey="average" stroke="#fff"  strokeWidth={4}  dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
        <div className="dashboard-grid">
          <article className="chart-card">
            <h2>ECEF Derivative trend</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ecefSeriesDerivivative} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" scale="auto" />
                  <YAxis scale="auto" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="x" stroke="#f79a38" opacity={0.5} strokeWidth={3}  dot={true} />
                  <Line type="monotone" dataKey="y" stroke="#02d9ff" opacity={0.5} strokeWidth={3}  dot={true} />
                  <Line type="monotone" dataKey="z" stroke="#00f9a6" opacity={0.5} strokeWidth={3}  dot={true} />
                  <Line type="monotone" dataKey="average" stroke="#fff"  strokeWidth={4}  dot={true} />
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