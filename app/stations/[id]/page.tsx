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
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

  async function handleDelete(taskId: number) {
    if (!confirm('Delete this task?')) return
    setDeletingId(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to delete task')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting task')
    } finally {
      setDeletingId(null)
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="container flex-between py-6">
          <h1 className="text-5xl font-black">
            {station?.name || 'STATION'}
          </h1>
          <Link href="/stations" className="btn btn-secondary text-sm">
            ← Back to Stations
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="section">
        <div className="container max-w-3xl">
          {/* Date Selector */}
          <div className="mb-12">
            <label htmlFor="date" className="block text-lg font-black mb-3">
              SELECT DATE
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input w-full text-base font-medium"
            />
          </div>

          {/* Date Display */}
          {selectedDate && (
            <h2 className="text-5xl font-black mb-12">
              {formatDate(selectedDate)}
            </h2>
          )}

          {/* Tasks */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin text-6xl mb-4">⚙️</div>
              <p className="text-xl font-semibold text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 card lg">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-4xl font-black mb-4">No Tasks</h3>
              <p className="text-lg text-gray-600 mb-8">
                No tasks for {station?.name} on {formatDate(selectedDate)}
              </p>
              <Link href="/add" className="btn btn-primary btn-lg">
                ➕ Add Task
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`card card-lg border-2 relative group ${
                    task.priority === 'high'
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'hover:border-gray-400'
                  } transition-all`}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="absolute top-4 right-4 p-2 text-2xl text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                    aria-label="Delete task"
                    title="Delete"
                  >
                    ✕
                  </button>

                  {/* Task Content */}
                  <div className="flex items-start justify-between gap-4 pr-16">
                    <div className="flex-1">
                      {/* Priority Badge */}
                      {task.priority === 'high' && (
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 bg-yellow-400 text-black font-black text-xs rounded">
                            ⚡ HIGH
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-2xl font-black mb-2">
                        {task.title}
                      </h3>

                      {/* Details */}
                      {task.details && (
                        <p className="text-base text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">
                          {task.details}
                        </p>
                      )}

                      {/* Created By */}
                      {task.created_by && (
                        <p className="text-sm text-gray-500 font-medium">
                          by {task.created_by}
                        </p>
                      )}
                    </div>

                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleTaskDone(task.id, task.is_done)}
                      className={`min-w-16 min-h-16 w-16 h-16 flex items-center justify-center border-2 rounded-lg font-black text-2xl transition-all flex-shrink-0 ${
                        task.is_done
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-black bg-white hover:bg-green-50 hover:border-green-500'
                      }`}
                      title={task.is_done ? 'Undo completion' : 'Mark as done'}
                    >
                      {task.is_done ? '✓' : ''}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
