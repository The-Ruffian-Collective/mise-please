# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mise Please** is a restaurant kitchen prep task management application built with Next.js 15. It allows kitchen staff to create, track, and manage daily prep tasks by station, with support for priority levels and print-ready Mise en Place lists.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Alternative: Use Vercel CLI for local dev with Vercel Postgres
# Install: npm i -g vercel
# Then: vercel link (first time only)
vercel dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking (no script defined, run directly)
npx tsc --noEmit
```

**Local Development Note**: If you need to test with the database locally, use `vercel dev` instead of `npm run dev`. This connects to your Vercel Postgres database. Otherwise, `npm run dev` works for UI testing, but API calls will fail without database credentials.

## Database Setup

The app uses Vercel Postgres. Before running, you must:

1. Copy `.env.example` to `.env.local` and populate with database credentials
2. Visit `/api/init` (either locally or on deployment) to initialize the database schema and seed default stations

The database has two tables:
- **stations**: Kitchen stations (Larder, Hot, Pastry, Grill, Misc)
- **tasks**: Prep tasks with station_id FK, priority, target_date, and completion status

## Architecture

### Next.js 15 App Router Structure

The app uses Next.js 15's App Router with the following organization:

- **app/**: All pages and API routes
  - **api/**: RESTful API endpoints for stations, tasks, and database initialization
  - **add/**: Page for adding new prep tasks
  - **stations/**: Station list and individual station detail pages (uses dynamic routing)
  - **overview/**: Overview page showing all tasks across all stations
  - **mep/[date]/**: Print-ready MEP (Mise en Place) view with dynamic date routing
  - **components/**: Shared React components (e.g., ThemeToggle)
  - **layout.tsx**: Root layout with ThemeProvider wrapping all pages
  - **page.tsx**: Home page

- **lib/**: Shared utilities and types
  - **db.ts**: All database operations using Vercel Postgres SQL template literals
  - **types.ts**: TypeScript type definitions for Station, Task, and API inputs
  - **theme-context.tsx**: React Context for dark/light theme state management

### Database Layer (lib/db.ts)

All database operations are centralized in `lib/db.ts`. Key functions:

- `initDatabase()` / `seedStations()`: Create tables and seed default stations
- `getStations()`, `createStation()`: Station CRUD operations
- `getTasks()`: Query tasks with optional filters (station_id, target_date, is_done)
- `createTask()`, `updateTask()`, `deleteTask()`: Task CRUD operations
- Date utilities: `getTomorrowDate()`, `getTodayDate()`

**Important**: Use the database functions from `lib/db.ts` rather than writing raw SQL in API routes.

### API Routes

All API routes follow RESTful conventions:

- `GET /api/init`: Initialize database (idempotent)
- `GET /api/stations`, `POST /api/stations`: List/create stations
- `GET /api/tasks`: List tasks (supports query params: station_id, target_date, is_done)
- `POST /api/tasks`: Create task
- `PATCH /api/tasks/[id]`: Update task (supports partial updates)
- `DELETE /api/tasks/[id]`: Delete task

API routes are located in `app/api/[resource]/route.ts` files and use Next.js Route Handlers.

**API Validation Pattern**: All POST/PATCH endpoints validate input before processing:
- Check required fields (e.g., `station_id`, `title`)
- Validate types and formats
- Trim string inputs
- Return 400 status with descriptive error messages for invalid input
- Return 500 status for server errors
- All endpoints use try/catch error handling

### Theme System

The app supports dark/light themes via React Context (`lib/theme-context.tsx`). The ThemeProvider wraps the entire app in `app/layout.tsx`, and theme state is persisted to localStorage. The ThemeToggle component is rendered as a floating button in the bottom-right corner.

## Key Patterns and Conventions

### TypeScript Configuration

- Uses path alias `@/*` to reference root directory files (e.g., `import { getTasks } from '@/lib/db'`)
- Strict mode enabled
- All files use TypeScript (.ts/.tsx)

### Next.js 15 Dynamic Routes

Dynamic route parameters are async in Next.js 15. All dynamic route handlers must await params:

```typescript
// API routes with dynamic segments
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // Must await params
  // ...
}

// Page components with dynamic segments
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // Must await params
  // ...
}
```

### Date Handling

- Dates are stored as `DATE` in Postgres (YYYY-MM-DD format)
- Default target_date for new tasks is tomorrow
- Use `getTomorrowDate()` and `getTodayDate()` from `lib/db.ts` for consistency

### Task Priority

Tasks have two priority levels: 'normal' (default) or 'high'. The `getTasks()` function automatically sorts by priority (high first), then by creation date.

### Database Queries

- Use parameterized queries or SQL template literals (`` sql`...` ``) to prevent SQL injection
- The `getTasks()` function builds dynamic WHERE clauses based on provided filters
- Date filters should use YYYY-MM-DD string format

## Important Notes

- This is a Vercel-first application; the database connection requires Vercel Postgres environment variables
- No authentication system is currently implemented
- No automated tests exist in the codebase
- The app is optimized for tablet/mobile use in restaurant kitchens
- Tailwind CSS is used for all styling
