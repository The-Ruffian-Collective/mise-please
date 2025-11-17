import { NextRequest, NextResponse } from 'next/server'
import { getStations, createStation } from '@/lib/db'

export async function GET() {
  try {
    const stations = await getStations()
    return NextResponse.json(stations)
  } catch (error) {
    console.error('Error fetching stations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Station name is required' },
        { status: 400 }
      )
    }

    const station = await createStation(name.trim())
    return NextResponse.json(station, { status: 201 })
  } catch (error) {
    console.error('Error creating station:', error)
    return NextResponse.json(
      { error: 'Failed to create station' },
      { status: 500 }
    )
  }
}
