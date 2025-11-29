'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Station } from '@/lib/types'
import Card from '@/app/components/Card'

const stationGradients: {
  [key: string]: 'primary' | 'success' | 'warning' | 'danger' | 'vibrant' | 'cool'
} = {
  'Larder': 'cool',
  'Hot': 'danger',
  'Pastry': 'primary',
  'Grill': 'warning',
  'Misc': 'success',
}

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="container flex-between py-6">
          <h1 className="text-5xl font-black">STATIONS</h1>
          <Link href="/" className="btn btn-secondary text-sm">
            ← Back Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="section">
        <div className="container">
          {/* Intro */}
          <div className="mb-16">
            <p className="text-xl text-gray-700">
              Choose a station to view and manage its tasks
            </p>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => {
              const gradientType = stationGradients[station.name] || 'primary'
              return (
                <Link
                  key={station.id}
                  href={`/stations/${station.id}`}
                  className="group"
                >
                  <Card gradient gradientType={gradientType} size="lg">
                    <div className="text-center">
                      <h2 className="text-3xl font-black mb-3 group-hover:translate-y-1 transition-transform">
                        {station.name}
                      </h2>
                      <p className="text-sm opacity-90">View & manage tasks</p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {stations.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🏗️</div>
              <h3 className="text-3xl font-black mb-3">No Stations Yet</h3>
              <p className="text-lg text-gray-600">
                Initialize the database to create default stations.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
