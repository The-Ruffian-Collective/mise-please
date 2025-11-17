import { NextRequest, NextResponse } from 'next/server'
import { updateTask, deleteTask } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params
    const id = parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    const updates = await request.json()

    // Validate updates
    if (updates.priority && !['normal', 'high'].includes(updates.priority)) {
      return NextResponse.json(
        { error: 'Priority must be "normal" or "high"' },
        { status: 400 }
      )
    }

    const task = await updateTask(id, updates)
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params
    const id = parseInt(idString, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    await deleteTask(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
