# Mise Please - Implementation Reference Guide

This document serves as a tactical guide for implementing the 7-step roadmap. Share this with Claude Code agents along with the feature prompts from the plan.

---

## Table of Contents

1. [File Structure Overview](#file-structure-overview)
2. [Key Type Definitions](#key-type-definitions)
3. [Code Patterns & Examples](#code-patterns--examples)
4. [By-Feature File Guide](#by-feature-file-guide)
5. [Common Patterns to Follow](#common-patterns-to-follow)
6. [CSS Variables Reference](#css-variables-reference)
7. [API Endpoint Patterns](#api-endpoint-patterns)

---

## File Structure Overview

### Directory Layout
```
mise-please/
├── app/
│   ├── add/page.tsx                    # Add task form (reference for form styling)
│   ├── components/
│   │   └── ThemeToggle.tsx             # Theme toggle (existing)
│   ├── mep/[date]/page.tsx             # Print view (don't modify)
│   ├── overview/page.tsx               # MAIN: Edit & Delete (Features 1, 4)
│   ├── stations/
│   │   ├── page.tsx                    # Station list (reference link in Feature 6)
│   │   ├── [id]/page.tsx               # MAIN: Edit & Delete (Features 2, 5)
│   │   └── manage/page.tsx             # NEW: Station management (Feature 6)
│   ├── api/
│   │   ├── init/route.ts               # DB init (don't modify)
│   │   ├── stations/
│   │   │   ├── route.ts                # POST /api/stations (existing)
│   │   │   └── [id]/route.ts           # NEW: PATCH & DELETE (Feature 6)
│   │   └── tasks/
│   │       ├── route.ts                # GET & POST tasks
│   │       └── [id]/route.ts           # PATCH & DELETE (existing API, use in Features 1-5)
│   ├── globals.css                     # CSS variables (theming)
│   └── layout.tsx                      # Root layout
├── lib/
│   ├── db.ts                           # Database layer (add functions for Feature 6)
│   ├── theme-context.tsx               # Theme management
│   └── types.ts                        # Type definitions
└── README.md / QUICKSTART.md           # Documentation

```

### Files You'll Need to Access
- **Always read first**: `lib/types.ts` (understand Task, Station interfaces)
- **Styling reference**: `app/add/page.tsx` (form styling patterns)
- **API patterns**: `app/api/tasks/[id]/route.ts` (PATCH/DELETE example)
- **State management**: `app/overview/page.tsx` (useState, useEffect patterns)
- **Database layer**: `lib/db.ts` (SQL query patterns)

---

## Key Type Definitions

### From `lib/types.ts`

```typescript
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
```

**For Feature 6 (Station Management), you'll need to add:**
```typescript
export interface UpdateStationInput {
  name?: string
}
```

---

## Code Patterns & Examples

### Pattern 1: Fetch and Set State (used everywhere)

**Location**: `app/overview/page.tsx` lines 36-63

```typescript
async function fetchTasks() {
  setLoading(true)
  try {
    const response = await fetch(`/api/tasks?target_date=${selectedDate}&is_done=false`)
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
  } finally {
    setLoading(false)
  }
}
```

**How to use it for delete/edit**:
1. Call API: `fetch('/api/tasks/[id]', { method: 'DELETE' })`
2. Check response.ok
3. On success, call fetchTasks() to refresh
4. On error, show alert()

---

### Pattern 2: Form Submission (from `app/add/page.tsx` lines 35-78)

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault()

  if (!stationId || !title.trim()) {
    alert('Please select a station and enter a task title')
    return
  }

  setLoading(true)
  setSuccess(false)

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: stationId,
        title: title.trim(),
        details: details.trim() || undefined,
        priority,
        created_by: createdBy.trim() || undefined,
      }),
    })

    if (response.ok) {
      // Clear form / refresh data
      setTitle('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } else {
      alert('Failed to create task')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Error creating task')
  } finally {
    setLoading(false)
  }
}
```

**For Feature 3 (Modal) and Feature 4 (Edit)**:
- Same pattern but PATCH instead of POST
- Endpoint: `fetch('/api/tasks/[id]', { method: 'PATCH', ... })`
- Body: only include fields being updated from `UpdateTaskInput`

---

### Pattern 3: API Route Structure (from `app/api/tasks/[id]/route.ts`)

```typescript
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
```

**For Feature 6 (Station update/delete)**:
- Create `/app/api/stations/[id]/route.ts`
- Use same PATCH and DELETE structure
- Call `updateStation(id, { name })` and `deleteStation(id)` from db.ts

---

### Pattern 4: Form Styling (from `app/add/page.tsx` lines 99-210)

```typescript
// Input field
<input
  type="text"
  id="title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
  placeholder="e.g., Prep 5kg mirepoix"
/>

// Textarea
<textarea
  id="details"
  value={details}
  onChange={(e) => setDetails(e.target.value)}
  rows={4}
  className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
  placeholder="Any additional information..."
/>

// Select dropdown
<select
  value={stationId}
  onChange={(e) => setStationId(Number(e.target.value))}
  className="w-full p-4 text-lg bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
>
  <option value="">Select a station</option>
  {stations.map((station) => (
    <option key={station.id} value={station.id}>
      {station.name}
    </option>
  ))}
</select>

// Priority toggle buttons
<button
  type="button"
  onClick={() => setPriority('normal')}
  className={`flex-1 p-4 text-lg rounded-lg border-2 transition-all ${
    priority === 'normal'
      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)]'
  }`}
>
  Normal
</button>

// Submit button
<button
  type="submit"
  disabled={loading}
  className="w-full p-5 text-xl font-semibold bg-[var(--success)] hover:opacity-90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
>
  {loading ? 'Adding...' : 'Add Task'}
</button>
```

**Use this exact pattern for**:
- Feature 3: TaskEditModal form styling
- Feature 6: Station management form styling

---

### Pattern 5: Modal Overlay (for Feature 3 & 7)

```typescript
// Use for centered modal with dark backdrop
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-[var(--card)] rounded-lg p-6 max-w-2xl w-full mx-4">
    {/* Modal content goes here */}
  </div>
</div>
```

---

### Pattern 6: Task Card Display (from `app/overview/page.tsx` lines 159-191)

```typescript
{stationTasks.map((task) => (
  <div
    key={task.id}
    className={`p-4 rounded border ${
      task.priority === 'high'
        ? 'border-[var(--warning)] bg-[var(--warning)]/10'
        : 'border-[var(--border)]'
    }`}
  >
    <div className="flex items-start gap-3">
      {task.priority === 'high' && (
        <span className="px-2 py-1 text-sm font-semibold bg-[var(--warning)] text-white rounded">
          HIGH
        </span>
      )}
      <div className="flex-1">
        <h4 className="text-lg font-semibold">{task.title}</h4>
        {task.details && (
          <p className="text-base opacity-75 mt-1 whitespace-pre-wrap">
            {task.details}
          </p>
        )}
        {task.created_by && (
          <p className="text-sm opacity-60 mt-1">by {task.created_by}</p>
        )}
      </div>
      {/* Add delete/edit buttons here (Features 1 & 4) */}
    </div>
  </div>
))}
```

**For Features 1 & 2 (Delete buttons)**:
- Add buttons in the flex container after closing `</div>`
- Position at top-right of card using flexbox

---

## By-Feature File Guide

### Feature 1: Delete Tasks from Overview

**Files to modify:**
- `app/overview/page.tsx`

**Files to reference:**
- `app/api/tasks/[id]/route.ts` (DELETE endpoint)
- `lib/types.ts` (Task interface)

**What to do:**
1. In the task card (lines 159-191), add delete button next to title
2. Add state: `const [deletingId, setDeletingId] = useState<number | null>(null)`
3. Add delete handler:
   ```typescript
   async function handleDelete(taskId: number) {
     if (!confirm('Delete this task?')) return
     try {
       const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
       if (response.ok) {
         fetchTasks() // Refresh the list
       } else {
         alert('Failed to delete task')
       }
     } catch (error) {
       console.error('Error:', error)
       alert('Error deleting task')
     }
   }
   ```
4. Render button with `var(--danger)` color and trash icon

---

### Feature 2: Delete Tasks from Station View

**Files to modify:**
- `app/stations/[id]/page.tsx`

**Files to reference:**
- `app/api/tasks/[id]/route.ts` (DELETE endpoint)
- `app/overview/page.tsx` (delete button pattern from Feature 1)

**What to do:**
- Copy the exact delete button and handler from Feature 1
- Use `fetchData()` instead of `fetchTasks()` to refresh
- Everything else is identical

---

### Feature 3: Edit Task Modal Component

**Files to create:**
- `app/components/TaskEditModal.tsx`

**Files to reference:**
- `app/add/page.tsx` (form styling)
- `lib/types.ts` (Task, UpdateTaskInput)

**What to do:**
1. Create a new component that accepts props:
   ```typescript
   interface TaskEditModalProps {
     task: Task | null
     stations: Station[]
     isOpen: boolean
     onClose: () => void
     onSave: (taskId: number, updates: UpdateTaskInput) => Promise<void>
   }
   ```
2. Render modal only if `isOpen` is true
3. Pre-fill form with task data if task is provided
4. On submit, call `onSave(task.id, updates)` then `onClose()`
5. Use exact same form styling as `app/add/page.tsx`
6. Don't call API directly - let parent handle it (passed via `onSave`)

---

### Feature 4: Edit Tasks from Overview

**Files to modify:**
- `app/overview/page.tsx`

**Files to create:**
- (Nothing - uses TaskEditModal from Feature 3)

**Files to reference:**
- `app/components/TaskEditModal.tsx` (the new component)
- `app/api/tasks/[id]/route.ts` (PATCH endpoint)

**What to do:**
1. Import `TaskEditModal` component
2. Add state: `const [editingTask, setEditingTask] = useState<Task | null>(null)`
3. Add edit button next to delete button in task card
4. Render modal:
   ```typescript
   <TaskEditModal
     task={editingTask}
     stations={stations}
     isOpen={!!editingTask}
     onClose={() => setEditingTask(null)}
     onSave={async (id, updates) => {
       try {
         const response = await fetch(`/api/tasks/${id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(updates)
         })
         if (response.ok) {
           fetchTasks()
         } else {
           alert('Failed to update task')
         }
       } catch (error) {
         console.error('Error:', error)
         alert('Error updating task')
       }
     }}
   />
   ```

---

### Feature 5: Edit Tasks from Station View

**Files to modify:**
- `app/stations/[id]/page.tsx`

**What to do:**
- Copy the exact edit button, state, and modal from Feature 4
- Use `fetchData()` instead of `fetchTasks()` to refresh
- Everything else is identical

---

### Feature 6: Station Management Page

**Files to create:**
- `app/stations/manage/page.tsx` (new page)
- `app/api/stations/[id]/route.ts` (new API route)
- Add `updateStation` and `deleteStation` to `lib/db.ts`

**Files to modify:**
- `app/stations/page.tsx` (add "Manage Stations" button link)

**Files to reference:**
- `lib/types.ts` (Station interface - you'll add UpdateStationInput)
- `app/api/stations/route.ts` (see POST pattern for reference)
- `app/stations/manage/page.tsx` (new listing/edit page)

**What to do:**

1. **Add to `lib/types.ts`:**
   ```typescript
   export interface UpdateStationInput {
     name?: string
   }
   ```

2. **Add to `lib/db.ts`:**
   ```typescript
   export async function updateStation(
     id: number,
     updates: { name: string }
   ): Promise<Station> {
     const { rows } = await sql`
       UPDATE stations
       SET name = ${updates.name}
       WHERE id = ${id}
       RETURNING *
     `
     return rows[0] as Station
   }

   export async function deleteStation(id: number): Promise<void> {
     await sql`
       DELETE FROM stations
       WHERE id = ${id}
     `
   }
   ```

3. **Create `app/api/stations/[id]/route.ts`:**
   - Use same structure as `app/api/tasks/[id]/route.ts`
   - PATCH: call `updateStation(id, { name })`
   - DELETE: call `deleteStation(id)`
   - Validate name is not empty on PATCH

4. **Create `app/stations/manage/page.tsx`:**
   - Fetch all stations on mount
   - Display as list with inline edit
   - Add "Add Station" form at top (calls POST /api/stations)
   - Each row: name, edit button (pencil icon, var(--accent)), delete button (trash icon, var(--danger))
   - On edit click, show input field + save/cancel buttons
   - On save, call PATCH /api/stations/[id]
   - On delete, show confirm then call DELETE /api/stations/[id]

5. **Modify `app/stations/page.tsx`:**
   - Add link/button to `/stations/manage` with text "Manage Stations"

---

### Feature 7: Enhanced Error Handling and User Feedback

**Files to create:**
- `app/components/Toast.tsx`
- `app/components/ConfirmDialog.tsx`

**Files to modify:**
- `app/overview/page.tsx`
- `app/stations/[id]/page.tsx`
- `app/add/page.tsx`
- `app/stations/manage/page.tsx` (after Feature 6)

**What to do:**

1. **Create `app/components/Toast.tsx`:**
   ```typescript
   // Fixed position bottom-left, auto-dismiss after 3s
   // Props: type: 'success' | 'error', message: string
   // Style with var(--success) or var(--danger)
   ```

2. **Create `app/components/ConfirmDialog.tsx`:**
   ```typescript
   // Modal overlay with centered dialog
   // Props: isOpen, title, message, onCancel, onConfirm
   ```

3. **Replace all `alert()` calls** with `<Toast />`
4. **Replace all `confirm()` calls** with `<ConfirmDialog />`
5. **Add loading states to buttons**:
   - Show "Deleting...", "Saving..." during API calls
   - Disable buttons while loading

---

## Common Patterns to Follow

### 1. Always use `'use client'` at the top
All pages and components that use hooks or interactivity need this directive.

### 2. CSS Variable Usage
```typescript
// Colors
bg-[var(--card)]        // Card background
border-[var(--border)]  // Borders
bg-[var(--accent)]      // Accent color
bg-[var(--warning)]     // High priority/warnings
bg-[var(--success)]     // Success/positive
bg-[var(--danger)]      // Delete/destructive
```

### 3. Responsive Classes
```typescript
// Use these Tailwind classes
sm:flex-row  // Side by side on small screens+
md:w-1/2     // Half width on medium screens+
```

### 4. Minimum Touch Target
All buttons and clickable elements should be at least 44px (p-4 = padding 1rem = 16px, so 44px from text + padding)

### 5. Error Handling
- Always wrap API calls in try/catch
- Always check response.ok before processing
- Always have fallback error messages
- Never leave user guessing if action succeeded

### 6. Loading States
- Show loading indicator or disable button while fetching
- Update button text: "Adding..." vs "Add Task"
- `disabled:opacity-50` + `disabled:cursor-not-allowed`

### 7. State Management
- Keep related state together
- Use `useState` for local component state
- Fetch fresh data after mutations (delete, update, create)

---

## CSS Variables Reference

**Location:** `app/globals.css`

```css
/* Light/Dark theme - automatically handled by CSS vars */
--background      /* Page background */
--foreground       /* Text color */
--card             /* Card/input background */
--card-hover       /* Card hover state */
--border           /* Border color */
--accent           /* Primary interactive color (blue) */
--accent-hover     /* Accent hover state */
--success          /* Success color (green) */
--warning          /* High priority/warning (orange) */
--danger           /* Delete/dangerous (red) */
```

**Usage in Tailwind:**
```typescript
className="bg-[var(--card)] border-[var(--border)]"
```

**Never hardcode colors** - always use CSS variables so dark/light mode works automatically.

---

## API Endpoint Patterns

### Existing Endpoints (don't modify)

**GET /api/stations**
- Returns: `Station[]`
- Used to populate station dropdowns

**POST /api/stations**
- Body: `{ name: string }`
- Returns: `Station`
- Used by Feature 6 (add station)

**GET /api/tasks**
- Query params: `?target_date=YYYY-MM-DD&is_done=false&station_id=N`
- Returns: `Task[]`
- Used to fetch tasks for filtering

**POST /api/tasks**
- Body: `CreateTaskInput`
- Returns: `Task`
- Used by Add Task form (existing)

**PATCH /api/tasks/[id]**
- Body: `UpdateTaskInput` (only fields to update)
- Returns: `Task`
- Used by Features 4 & 5

**DELETE /api/tasks/[id]**
- Returns: `{ success: true }`
- Used by Features 1 & 2

### New Endpoints (to create in Feature 6)

**PATCH /api/stations/[id]**
- Body: `{ name: string }`
- Returns: `Station`
- Error if name is duplicate or empty

**DELETE /api/stations/[id]**
- Returns: `{ success: true }`
- Note: Will cascade delete all tasks for that station

---

## Quick Troubleshooting

### "Module not found" errors
- Check imports match actual file paths
- `@/lib/...` is alias for `lib/...`
- `@/app/...` is alias for `app/...`

### Type errors with `Task`
- Make sure to import from `lib/types`
- `UpdateTaskInput` only has optional fields

### CSS not working
- Check using CSS variables: `var(--card)` not `var(card)`
- Wrap in square brackets for Tailwind: `bg-[var(--card)]`
- Check theme toggle is working (bottom-right corner icon)

### API calls failing
- Check endpoint URL matches exactly
- Check body matches type (e.g., `UpdateTaskInput`)
- Check response.ok before processing
- Always have error fallback

### Modal not showing
- Check `isOpen` prop is true
- Check `z-50` class exists (above other elements)
- Check backdrop div is rendering

---

## File Checklist for Cloud Agents

Before starting each feature, agents should verify:

- [ ] Have read `lib/types.ts` completely
- [ ] Have read this IMPLEMENTATION_REFERENCE.md
- [ ] Have read the feature prompt from plan.md
- [ ] Have identified which files to modify/create
- [ ] Have identified reference files to check patterns
- [ ] Understand the API endpoint being called
- [ ] Know what `setState` function to call after API success
- [ ] Know what CSS variables to use for colors

Good luck! 🚀