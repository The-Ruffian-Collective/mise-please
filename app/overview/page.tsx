'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Task, Station } from '@/lib/types'

interface GroupedTasks {
  [stationName: string]: Task[]
}

export default function OverviewPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    fetchStations()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchTasks()
    }
  }, [selectedDate])

  async function fetchStations() {
    try {
      const response = await fetch('/api/stations')
      if (response.ok) {
        const data = await response.json()
        setStations(data)
      }
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

  async function fetchTasks() {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/tasks?target_date=${selectedDate}&is_done=false`
      )
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedTasks = tasks.reduce<GroupedTasks>((acc, task) => {
    const stationName = task.station_name || 'Unknown'
    if (!acc[stationName]) {
      acc[stationName] = []
    }
    acc[stationName].push(task)
    return acc
  }, {})

  // Ensure all stations are shown even if they have no tasks
  stations.forEach((station) => {
    if (!groupedTasks[station.name]) {
      groupedTasks[station.name] = []
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleGenerateMEP = () => {
    router.push(`/mep/${selectedDate}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Overview</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-[var(--card-hover)] hover:bg-[var(--border)] rounded transition-colors"
        >
          Home
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="date" className="block text-lg font-medium mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateMEP}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-[var(--success)] hover:opacity-90 text-white rounded-lg transition-opacity"
            >
              Generate MEP
            </button>
          </div>
        </div>

        {selectedDate && (
          <h2 className="text-2xl font-semibold mb-6">
            {formatDate(selectedDate)}
          </h2>
        )}

        {loading ? (
          <p className="text-center text-lg opacity-75">Loading tasks...</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTasks)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([stationName, stationTasks]) => (
                <div
                  key={stationName}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6"
                >
                  <h3 className="text-2xl font-bold mb-4 flex items-center justify-between">
                    <span>{stationName}</span>
                    <span className="text-lg font-normal opacity-60">
                      {stationTasks.length} task{stationTasks.length !== 1 ? 's' : ''}
                    </span>
                  </h3>

                  {stationTasks.length === 0 ? (
                    <p className="text-lg opacity-50">No tasks</p>
                  ) : (
                    <div className="space-y-3">
                      {stationTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 rounded border ${
                            task.priority === 'high'
                              ? 'border-[var(--warning)] bg-[var(--warning)]/10'
                              : 'border-[var(--border)]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {task.priority === 'high' && (
                              <span className="px-2 py-1 text-sm font-semibold bg-[var(--warning)] text-white rounded">
                                HIGH
                              </span>
                            )}
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold">
                                {task.title}
                              </h4>
                              {task.details && (
                                <p className="text-base opacity-75 mt-1 whitespace-pre-wrap">
                                  {task.details}
                                </p>
                              )}
                              {task.created_by && (
                                <p className="text-sm opacity-60 mt-1">
                                  by {task.created_by}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl opacity-75 mb-4">
              No tasks scheduled for this date
            </p>
            <Link
              href="/add"
              className="inline-block px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors"
            >
              Add Task
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
