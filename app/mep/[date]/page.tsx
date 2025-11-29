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
    <div className="min-h-screen bg-white">
      {/* Header - hidden in print */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white print:hidden">
        <div className="container flex-between py-6">
          <h1 className="text-5xl font-black">MISE EN PLACE</h1>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-lg"
            >
              🖨️ Print
            </button>
            <Link
              href="/overview"
              className="btn btn-secondary text-sm"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      {/* Main content - print friendly */}
      <main className="section max-w-5xl mx-auto">
        {/* Title - for print */}
        <div className="mb-12 text-center print:mb-6">
          <h1 className="text-6xl font-black mb-4 print:text-4xl">MISE EN PLACE</h1>
          <p className="text-3xl font-black text-gray-700 print:text-2xl">
            {targetDate && formatDate(targetDate)}
          </p>
        </div>

        {/* Tasks grouped by station */}
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-4xl font-black mb-4">No Tasks</h3>
            <p className="text-lg text-gray-600">
              No tasks scheduled for {targetDate && formatDate(targetDate)}
            </p>
          </div>
        ) : (
          <div className="space-y-12 print:space-y-8">
            {Object.entries(groupedTasks)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([stationName, stationTasks]) => (
                <section
                  key={stationName}
                  className="print-break-inside-avoid border-b-2 border-black pb-8 print:pb-6 last:border-b-0"
                >
                  <h2 className="text-4xl font-black mb-6 print:text-2xl uppercase tracking-tight">
                    {stationName}
                  </h2>

                  {stationTasks.length === 0 ? (
                    <p className="text-lg text-gray-500 ml-6">No tasks</p>
                  ) : (
                    <ul className="space-y-4 print:space-y-2 ml-6">
                      {stationTasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-4">
                          <span className="text-2xl mt-0 flex-shrink-0">✓</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xl font-bold print:text-lg">
                              {task.priority === 'high' && (
                                <span className="inline-block px-2 py-1 mr-2 text-sm font-black bg-yellow-400 text-black rounded print:bg-gray-300">
                                  ⚡ HIGH
                                </span>
                              )}
                              {task.title}
                            </p>
                            {task.details && (
                              <p className="text-base text-gray-700 mt-2 ml-6 print:ml-0 print:text-sm whitespace-pre-wrap leading-relaxed">
                                {task.details}
                              </p>
                            )}
                            {task.created_by && (
                              <p className="text-sm text-gray-500 mt-1 ml-6 print:ml-0">
                                — {task.created_by}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
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
            padding: 1cm !important;
          }

          h1 {
            font-size: 28pt !important;
          }

          h2 {
            font-size: 20pt !important;
          }

          p,
          li {
            font-size: 13pt !important;
          }

          section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
