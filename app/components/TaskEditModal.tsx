'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Task, Station, UpdateTaskInput, Priority } from '@/lib/types'

interface TaskEditModalProps {
  task: Task | null
  stations: Station[]
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: number, updates: UpdateTaskInput) => Promise<void>
}

export default function TaskEditModal({
  task,
  stations,
  isOpen,
  onClose,
  onSave,
}: TaskEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [targetDate, setTargetDate] = useState('')
  const [stationId, setStationId] = useState<number | ''>('')

  // Initialize form when task changes or modal opens
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title)
      setDetails(task.details || '')
      setPriority(task.priority)
      setTargetDate(task.target_date)
      setStationId(task.station_id)
      setError('')
    }
  }, [isOpen, task])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    if (!stationId) {
      setError('Please select a station')
      return
    }

    if (!task) return

    setLoading(true)

    try {
      const updates: UpdateTaskInput = {
        title: title.trim(),
        details: details.trim() || undefined,
        priority,
        target_date: targetDate || undefined,
      }

      await onSave(task.id, updates)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save task'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:opacity-75 transition-opacity"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="station"
                className="block text-lg font-medium mb-2"
              >
                Station *
              </label>
              <select
                id="station"
                value={stationId}
                onChange={(e) => setStationId(Number(e.target.value))}
                className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
              >
                <option value="">Select a station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-lg font-medium mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="e.g., Prep 5kg mirepoix"
                required
              />
            </div>

            <div>
              <label
                htmlFor="details"
                className="block text-lg font-medium mb-2"
              >
                Details (optional)
              </label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                placeholder="Any additional information..."
              />
            </div>

            <div>
              <label
                htmlFor="target-date"
                className="block text-lg font-medium mb-2"
              >
                Target Date
              </label>
              <input
                type="date"
                id="target-date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">Priority</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`flex-1 p-4 text-lg rounded-lg border-2 transition-all ${
                    priority === 'normal'
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex-1 p-4 text-lg rounded-lg border-2 transition-all ${
                    priority === 'high'
                      ? 'border-[var(--warning)] bg-[var(--warning)] text-white'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]'
                  }`}
                >
                  High Priority
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 pt-6 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 p-4 text-lg font-semibold bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] text-[var(--text)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 p-4 text-lg font-semibold bg-[var(--success)] hover:opacity-90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
