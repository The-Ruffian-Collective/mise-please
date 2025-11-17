import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const station_id = searchParams.get('station_id')
    const target_date = searchParams.get('target_date')
    const is_done = searchParams.get('is_done')

    const filters: {
      station_id?: number
      target_date?: string
      is_done?: boolean
    } = {}

    if (station_id) {
      filters.station_id = parseInt(station_id, 10)
    }

    if (target_date) {
      filters.target_date = target_date
    }

    if (is_done !== null) {
      filters.is_done = is_done === 'true'
    }

    const tasks = await getTasks(filters)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { station_id, title, details, priority, target_date, created_by } =
      body

    // Validation
    if (!station_id || typeof station_id !== 'number') {
      return NextResponse.json(
        { error: 'Valid station_id is required' },
        { status: 400 }
      )
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      )
    }

    if (priority && !['normal', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priority must be "normal" or "high"' },
        { status: 400 }
      )
    }

    const task = await createTask({
      station_id,
      title: title.trim(),
      details: details?.trim() || undefined,
      priority: priority || 'normal',
      target_date,
      created_by: created_by?.trim() || undefined,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
