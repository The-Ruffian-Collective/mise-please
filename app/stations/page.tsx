'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Station } from '@/lib/types'

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([])

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stations</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-[var(--card-hover)] hover:bg-[var(--border)] rounded transition-colors"
        >
          Home
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stations.map((station) => (
            <Link
              key={station.id}
              href={`/stations/${station.id}`}
              className="bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] p-8 rounded-lg text-center transition-colors"
            >
              <h2 className="text-2xl font-semibold">{station.name}</h2>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
