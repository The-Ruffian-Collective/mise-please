'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { Station } from '@/lib/types'

export default function AddTaskPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [stationId, setStationId] = useState<number | ''>('')
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high'>('normal')
  const [createdBy, setCreatedBy] = useState('')

  useEffect(() => {
    fetchStations()
  }, [])

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!stationId || !title.trim()) {
      alert('Please select a station and enter a task title')
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station_id: stationId,
          title: title.trim(),
          details: details.trim() || undefined,
          priority,
          created_by: createdBy.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Clear form
        setTitle('')
        setDetails('')
        setPriority('normal')
        // Keep station and created_by for fast repeated entry
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        alert('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Task</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-[var(--card-hover)] hover:bg-[var(--border)] rounded transition-colors"
        >
          Home
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-2xl w-full mx-auto">
        {success && (
          <div className="mb-4 p-4 bg-[var(--success)] text-white rounded-lg">
            Task added successfully!
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

          <div>
            <label
              htmlFor="created-by"
              className="block text-lg font-medium mb-2"
            >
              Your Name (optional)
            </label>
            <input
              type="text"
              id="created-by"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Chef name"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-5 text-xl font-semibold bg-[var(--success)] hover:opacity-90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </main>
    </div>
  )
}
