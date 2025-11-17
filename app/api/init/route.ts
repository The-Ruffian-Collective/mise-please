import { NextResponse } from 'next/server'
import { initDatabase, seedStations } from '@/lib/db'

export async function GET() {
  try {
    await initDatabase()
    await seedStations()
    return NextResponse.json({
      success: true,
      message: 'Database initialized and seeded successfully',
    })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}
