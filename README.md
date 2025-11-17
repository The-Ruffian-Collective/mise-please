# Mise en Place - Kitchen Prep Task Manager

A simple, fast web app for restaurant kitchens to manage daily prep tasks.

## Features

- Add prep tasks by station with priority levels
- View tasks grouped by station
- Generate clean, print-ready Mise en Place lists
- Mobile-friendly interface optimized for tablets and phones
- Dark theme with large, tap-friendly controls

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (free tier works)

### Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd mise-please
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your database credentials (see Database Setup below)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

#### Option 1: Vercel Postgres (Recommended for Production)

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the environment variables to `.env.local`
4. Visit `/api/init` in your browser to initialize the database and seed stations

#### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database
3. Add the connection string to `.env.local`:
   ```
   POSTGRES_URL="postgresql://user:password@localhost:5432/mise_please"
   ```
4. Visit `/api/init` to initialize the database

## Deployment to Vercel

### First-Time Deployment

1. Push your code to GitHub

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project" and import your repository

4. Vercel will auto-detect Next.js - click "Deploy"

5. Once deployed, add a Postgres database:
   - Go to your project dashboard
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Follow the prompts

6. Initialize the database:
   - Visit `https://your-app.vercel.app/api/init`
   - This creates tables and seeds default stations

### Subsequent Deployments

Simply push to your main branch - Vercel will automatically deploy.

## Usage

### For Chefs

1. **Add Tasks**: Go to `/add` to quickly log prep tasks
   - Select your station
   - Enter task title and optional details
   - Choose priority (normal or high)
   - Tasks default to tomorrow's date

2. **View Station Tasks**: Go to `/stations` and select your station
   - See all tasks for your station
   - Change the date to view different days
   - Mark tasks as done with the checkbox

### For Head Chef

1. **Overview**: Go to `/overview`
   - See all tasks across all stations
   - Grouped by station
   - Filter by date

2. **Generate MEP**: Click "Generate MEP" button
   - Creates a clean, print-ready list
   - Use browser print or display on tablet

## Stations

Default stations are:
- Larder
- Hot
- Pastry
- Grill
- Misc

To add new stations, use the Stations API:
```bash
curl -X POST https://your-app.vercel.app/api/stations \
  -H "Content-Type: application/json" \
  -d '{"name":"New Station"}'
```

## API Routes

- `GET /api/init` - Initialize database and seed stations
- `GET /api/stations` - List all stations
- `POST /api/stations` - Create new station
- `GET /api/tasks` - List tasks (supports filtering by station, date, status)
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Development

### Project Structure

```
mise-please/
├── app/
│   ├── api/          # API routes
│   ├── add/          # Add task page
│   ├── stations/     # Stations list and individual station views
│   ├── overview/     # Head chef overview
│   ├── mep/          # MEP print view
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── lib/
│   ├── db.ts         # Database utilities
│   └── types.ts      # TypeScript types
└── public/           # Static assets
```

### Database Schema

**stations**
- id (serial, primary key)
- name (varchar, unique)
- created_at (timestamp)

**tasks**
- id (serial, primary key)
- station_id (integer, foreign key)
- title (varchar)
- details (text, nullable)
- priority (varchar: 'normal' | 'high')
- target_date (date)
- created_at (timestamp)
- created_by (varchar, nullable)
- is_done (boolean)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
