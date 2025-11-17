import { sql } from '@vercel/postgres'
import { Task, Station, CreateTaskInput, UpdateTaskInput } from './types'

// Initialize database tables
export async function initDatabase() {
  try {
    // Create stations table
    await sql`
      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        details TEXT,
        priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
        target_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        is_done BOOLEAN DEFAULT false
      )
    `

    // Create index on target_date and station_id for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_tasks_target_date ON tasks(target_date)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_tasks_station_id ON tasks(station_id)
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

// Seed default stations
export async function seedStations() {
  const defaultStations = ['Larder', 'Hot', 'Pastry', 'Grill', 'Misc']

  try {
    for (const stationName of defaultStations) {
      await sql`
        INSERT INTO stations (name)
        VALUES (${stationName})
        ON CONFLICT (name) DO NOTHING
      `
    }
    console.log('Stations seeded successfully')
  } catch (error) {
    console.error('Error seeding stations:', error)
    throw error
  }
}

// Station queries
export async function getStations(): Promise<Station[]> {
  const { rows } = await sql`
    SELECT id, name, created_at
    FROM stations
    ORDER BY id ASC
  `
  return rows as Station[]
}

export async function createStation(name: string): Promise<Station> {
  const { rows } = await sql`
    INSERT INTO stations (name)
    VALUES (${name})
    RETURNING *
  `
  return rows[0] as Station
}

// Task queries
export async function getTasks(filters?: {
  station_id?: number
  target_date?: string
  is_done?: boolean
}): Promise<Task[]> {
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (filters?.station_id !== undefined) {
    conditions.push(`t.station_id = $${paramIndex}`)
    values.push(filters.station_id)
    paramIndex++
  }

  if (filters?.target_date) {
    conditions.push(`t.target_date = $${paramIndex}`)
    values.push(filters.target_date)
    paramIndex++
  }

  if (filters?.is_done !== undefined) {
    conditions.push(`t.is_done = $${paramIndex}`)
    values.push(filters.is_done)
    paramIndex++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const queryText = `
    SELECT
      t.id,
      t.station_id,
      s.name as station_name,
      t.title,
      t.details,
      t.priority,
      t.target_date::text as target_date,
      t.created_at,
      t.created_by,
      t.is_done
    FROM tasks t
    JOIN stations s ON t.station_id = s.id
    ${whereClause}
    ORDER BY
      CASE WHEN t.priority = 'high' THEN 0 ELSE 1 END,
      t.created_at ASC
  `

  const { rows } = await sql.query(queryText, values)
  return rows as Task[]
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const {
    station_id,
    title,
    details = null,
    priority = 'normal',
    target_date,
    created_by = null,
  } = input

  // Default to tomorrow if no target_date provided
  const finalTargetDate = target_date || getTomorrowDate()

  const { rows } = await sql`
    INSERT INTO tasks (station_id, title, details, priority, target_date, created_by)
    VALUES (${station_id}, ${title}, ${details}, ${priority}, ${finalTargetDate}, ${created_by})
    RETURNING *
  `

  return rows[0] as Task
}

export async function updateTask(
  id: number,
  updates: UpdateTaskInput
): Promise<Task> {
  const fields = []
  const values = []

  if (updates.title !== undefined) {
    fields.push('title')
    values.push(updates.title)
  }
  if (updates.details !== undefined) {
    fields.push('details')
    values.push(updates.details)
  }
  if (updates.priority !== undefined) {
    fields.push('priority')
    values.push(updates.priority)
  }
  if (updates.target_date !== undefined) {
    fields.push('target_date')
    values.push(updates.target_date)
  }
  if (updates.is_done !== undefined) {
    fields.push('is_done')
    values.push(updates.is_done)
  }

  if (fields.length === 0) {
    throw new Error('No fields to update')
  }

  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ')

  const { rows } = await sql.query(
    `UPDATE tasks SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  )

  return rows[0] as Task
}

export async function deleteTask(id: number): Promise<void> {
  await sql`DELETE FROM tasks WHERE id = ${id}`
}

// Utility functions
export function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}
