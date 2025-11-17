'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Task, Station } from '@/lib/types'
import { use } from 'react'

interface GroupedTasks {
  [stationName: string]: Task[]
}

export default function MEPPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const resolvedParams = use(params)
  const dateParam = resolvedParams.date

  const [tasks, setTasks] = useState<Task[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [targetDate, setTargetDate] = useState<string>('')

  useEffect(() => {
    // Handle 'tomorrow' or specific date
    if (dateParam === 'tomorrow') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setTargetDate(tomorrow.toISOString().split('T')[0])
    } else {
      setTargetDate(dateParam)
    }
  }, [dateParam])

  useEffect(() => {
    if (targetDate) {
      fetchData()
    }
  }, [targetDate])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch stations
      const stationsResponse = await fetch('/api/stations')
      if (stationsResponse.ok) {
        const stationsData = await stationsResponse.json()
        setStations(stationsData)
      }

      // Fetch tasks
      const tasksResponse = await fetch(
        `/api/tasks?target_date=${targetDate}&is_done=false`
      )
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading MEP...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header - hidden in print */}
      <header className="bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">Mise en Place</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[var(--success)] hover:opacity-90 text-white rounded transition-opacity"
          >
            Print
          </button>
          <Link
            href="/overview"
            className="px-4 py-2 bg-[var(--card-hover)] hover:bg-[var(--border)] rounded transition-colors"
          >
            Back
          </Link>
        </div>
      </header>

      {/* Main content - print friendly */}
      <main className="p-6 max-w-5xl mx-auto">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Mise en Place</h1>
          <p className="text-2xl">{targetDate && formatDate(targetDate)}</p>
        </div>

        {/* Tasks grouped by station */}
        <div className="space-y-8">
          {Object.entries(groupedTasks)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([stationName, stationTasks]) => (
              <div
                key={stationName}
                className="print-break-inside-avoid border-b-2 border-[var(--border)] pb-6 last:border-b-0"
              >
                <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">
                  {stationName}
                </h2>

                {stationTasks.length === 0 ? (
                  <p className="text-lg opacity-50 ml-4">No tasks</p>
                ) : (
                  <ul className="space-y-3 ml-4">
                    {stationTasks.map((task) => (
                      <li key={task.id} className="flex items-start gap-3">
                        <span className="text-lg mt-1">•</span>
                        <div className="flex-1">
                          <p className="text-lg font-medium">
                            {task.priority === 'high' && (
                              <span className="inline-block px-2 py-1 mr-2 text-sm font-bold bg-[var(--warning)] text-white rounded">
                                HIGH
                              </span>
                            )}
                            {task.title}
                          </p>
                          {task.details && (
                            <p className="text-base opacity-75 mt-1 ml-4 whitespace-pre-wrap">
                              {task.details}
                            </p>
                          )}
                          {task.created_by && (
                            <p className="text-sm opacity-60 mt-1 ml-4">
                              Added by: {task.created_by}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl opacity-75">No tasks scheduled</p>
          </div>
        )}
      </main>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }

          * {
            color: black !important;
          }

          .print-break-inside-avoid {
            break-inside: avoid;
          }

          main {
            max-width: 100% !important;
            padding: 1cm !important;
          }

          h1 {
            font-size: 24pt !important;
          }

          h2 {
            font-size: 18pt !important;
          }

          p,
          li {
            font-size: 12pt !important;
          }
        }
      `}</style>
    </div>
  )
}
