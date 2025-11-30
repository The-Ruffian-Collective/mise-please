'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Task, Station, UpdateTaskInput } from '@/lib/types'
import TaskEditModal from '@/app/components/TaskEditModal'

interface GroupedTasks {
  [stationName: string]: Task[]
}

export default function OverviewPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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

  async function handleDelete(taskId: number) {
    if (!confirm('Delete this task?')) return
    setDeletingId(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchTasks()
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

  async function handleSaveTask(taskId: number, updates: UpdateTaskInput) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchTasks()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert(
        error instanceof Error ? error.message : 'Error updating task'
      )
      throw error
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="container flex-between py-6">
          <h1 className="text-5xl font-black">OVERVIEW</h1>
          <Link href="/" className="btn btn-secondary text-sm">
            ← Back Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="section">
        <div className="container">
          {/* Date & Action Controls */}
          <div className="mb-12 flex flex-col sm:flex-row gap-6 items-end">
            <div className="flex-1">
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
            <button
              onClick={handleGenerateMEP}
              className="btn btn-primary btn-lg w-full sm:w-auto"
            >
              🖨️ Generate MEP
            </button>
          </div>

          {/* Date Display */}
          {selectedDate && (
            <h2 className="text-5xl font-black mb-12">
              {formatDate(selectedDate)}
            </h2>
          )}

          {/* Tasks By Station */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin text-6xl mb-4">⚙️</div>
              <p className="text-xl font-semibold text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 card lg">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-4xl font-black mb-4">No Tasks Yet</h3>
              <p className="text-lg text-gray-600 mb-8">
                No tasks scheduled for {formatDate(selectedDate)}
              </p>
              <Link href="/add" className="btn btn-primary btn-lg">
                ➕ Create First Task
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedTasks)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([stationName, stationTasks]) => (
                  <section key={stationName}>
                    {/* Station Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-4xl font-black">{stationName}</h3>
                      <span className="text-2xl font-black text-gray-400">
                        {stationTasks.length}
                      </span>
                    </div>

                    {/* Station Tasks */}
                    {stationTasks.length === 0 ? (
                      <div className="card lg text-center py-8 text-gray-500">
                        <p className="text-lg">No tasks for this station</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stationTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`card card-lg border-2 relative overflow-hidden ${
                              task.priority === 'high'
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'hover:border-gray-400'
                            } transition-all`}
                          >
                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="p-2 text-2xl hover:bg-gray-200 rounded transition-colors"
                                aria-label="Edit task"
                                title="Edit"
                              >
                                ✎
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                disabled={deletingId === task.id}
                                className="p-2 text-2xl text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                aria-label="Delete task"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Content */}
                            <div className="pr-20">
                              <div className="flex items-start gap-4 mb-3">
                                {task.priority === 'high' && (
                                  <span className="inline-block px-3 py-1 bg-yellow-400 text-black font-black text-xs rounded">
                                    ⚡ HIGH
                                  </span>
                                )}
                              </div>
                              <h4 className="text-2xl font-black mb-2">
                                {task.title}
                              </h4>
                              {task.details && (
                                <p className="text-base text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">
                                  {task.details}
                                </p>
                              )}
                              {task.created_by && (
                                <p className="text-sm text-gray-500 font-medium">
                                  by {task.created_by}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <TaskEditModal
        task={editingTask}
        stations={stations}
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
      />
    </div>
  )
}
