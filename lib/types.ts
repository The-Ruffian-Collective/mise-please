export type Priority = 'normal' | 'high'

export interface Station {
  id: number
  name: string
  created_at: Date
}

export interface Task {
  id: number
  station_id: number
  station_name?: string
  title: string
  details: string | null
  priority: Priority
  target_date: string // YYYY-MM-DD format
  created_at: Date
  created_by: string | null
  is_done: boolean
}

export interface CreateTaskInput {
  station_id: number
  title: string
  details?: string
  priority?: Priority
  target_date?: string
  created_by?: string
}

export interface UpdateTaskInput {
  title?: string
  details?: string
  priority?: Priority
  target_date?: string
  is_done?: boolean
}
