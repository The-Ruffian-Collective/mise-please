'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { Station } from '@/lib/types'
import Button from '@/app/components/Button'
import Card from '@/app/components/Card'

export default function AddTaskPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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
    setError('')

    if (!stationId || !title.trim()) {
      setError('Please select a station and enter a task title')
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
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Failed to create task. Please try again.')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setError('Error creating task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="container flex-between py-6">
          <h1 className="text-5xl font-black">ADD TASK</h1>
          <Link href="/" className="btn btn-secondary text-sm">
            ← Back Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="section">
        <div className="container max-w-2xl">
          {/* Success Message */}
          {success && (
            <Card size="lg" className="mb-8 bg-green-50 border-green-300">
              <div className="flex items-center gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <h3 className="text-lg font-black text-green-900">Task Added Successfully!</h3>
                  <p className="text-sm text-green-800">Add another task or return home.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card size="lg" className="mb-8 bg-red-50 border-red-300">
              <div className="flex items-center gap-4">
                <div className="text-3xl">⚠</div>
                <div>
                  <h3 className="text-lg font-black text-red-900">Oops!</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Form Card */}
          <Card size="lg" className="border-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Station Field */}
              <div>
                <label
                  htmlFor="station"
                  className="block text-lg font-black mb-3 text-black"
                >
                  Select Station *
                </label>
                <select
                  id="station"
                  value={stationId}
                  onChange={(e) => setStationId(Number(e.target.value) || '')}
                  className="input text-base font-medium"
                  required
                >
                  <option value="">Choose a station...</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-lg font-black mb-3 text-black">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input text-base font-medium"
                  placeholder="e.g., Prep 5kg mirepoix"
                  required
                />
              </div>

              {/* Details Field */}
              <div>
                <label htmlFor="details" className="block text-lg font-black mb-3 text-black">
                  Details
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="input resize-none text-base font-medium"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Priority Toggle */}
              <div>
                <label className="block text-lg font-black mb-3 text-black">Priority</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`flex-1 py-3 px-6 font-black text-center rounded-lg border-2 transition-all ${
                      priority === 'normal'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-gray-50'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`flex-1 py-3 px-6 font-black text-center rounded-lg border-2 transition-all ${
                      priority === 'high'
                        ? 'bg-yellow-400 text-black border-yellow-400'
                        : 'bg-white text-black border-black hover:bg-yellow-50'
                    }`}
                  >
                    ⚡ HIGH PRIORITY
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="created-by" className="block text-lg font-black mb-3 text-black">
                  Chef Name
                </label>
                <input
                  type="text"
                  id="created-by"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="input text-base font-medium"
                  placeholder="Your name (optional)"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={loading}
              >
                {loading ? 'Adding Task...' : 'Add Task'}
              </Button>
            </form>
          </Card>

          {/* Helpful Text */}
          <div className="mt-12 text-center text-gray-600">
            <p className="text-sm">
              Tasks are added to your prep list immediately and appear in the Overview and Station views.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
