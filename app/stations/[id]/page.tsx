'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Task, Station } from '@/lib/types'
import { use } from 'react'

export default function StationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const stationId = parseInt(resolvedParams.id, 10)

  const [tasks, setTasks] = useState<Task[]>([])
  const [station, setStation] = useState<Station | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchData()
    }
  }, [stationId, selectedDate])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch station details
      const stationsResponse = await fetch('/api/stations')
      if (stationsResponse.ok) {
        const stations = await stationsResponse.json()
        const currentStation = stations.find(
          (s: Station) => s.id === stationId
        )
        setStation(currentStation)
      }

      // Fetch tasks
      const tasksResponse = await fetch(
        `/api/tasks?station_id=${stationId}&target_date=${selectedDate}&is_done=false`
      )
      if (tasksResponse.ok) {
        const data = await tasksResponse.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleTaskDone(taskId: number, isDone: boolean) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_done: !isDone }),
      })

      if (response.ok) {
        fetchData() // Refresh tasks
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {station?.name || 'Station'} Tasks
        </h1>
        <Link
          href="/stations"
          className="px-4 py-2 bg-[var(--card-hover)] hover:bg-[var(--border)] rounded transition-colors"
        >
          Back
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
        <div className="mb-6">
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

        {selectedDate && (
          <h2 className="text-xl font-semibold mb-4">
            {formatDate(selectedDate)}
          </h2>
        )}

        {loading ? (
          <p className="text-center text-lg opacity-75">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl opacity-75 mb-4">No tasks for this date</p>
            <Link
              href="/add"
              className="inline-block px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors"
            >
              Add Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 rounded-lg border-2 ${
                  task.priority === 'high'
                    ? 'border-[var(--warning)] bg-[var(--card)]'
                    : 'border-[var(--border)] bg-[var(--card)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {task.priority === 'high' && (
                        <span className="px-2 py-1 text-sm font-semibold bg-[var(--warning)] text-white rounded">
                          HIGH
                        </span>
                      )}
                      <h3 className="text-xl font-semibold">{task.title}</h3>
                    </div>
                    {task.details && (
                      <p className="text-lg opacity-75 mb-2 whitespace-pre-wrap">
                        {task.details}
                      </p>
                    )}
                    {task.created_by && (
                      <p className="text-sm opacity-60">by {task.created_by}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleTaskDone(task.id, task.is_done)}
                    className="min-w-12 min-h-12 w-12 h-12 flex items-center justify-center border-2 border-[var(--border)] rounded-lg hover:bg-[var(--success)] hover:border-[var(--success)] transition-colors"
                    title="Mark as done"
                  >
                    {task.is_done ? '✓' : ''}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
