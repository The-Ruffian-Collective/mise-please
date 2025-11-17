import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--card)] border-b border-[var(--border)] p-4">
        <h1 className="text-3xl font-bold">Mise Please</h1>
      </header>

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/add"
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white p-8 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Add Task</h2>
            <p className="text-lg opacity-90">Quick task entry</p>
          </Link>

          <Link
            href="/overview"
            className="bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] p-8 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Overview</h2>
            <p className="text-lg opacity-75">View all tasks</p>
          </Link>

          <Link
            href="/stations"
            className="bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] p-8 rounded-lg text-center transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">Stations</h2>
            <p className="text-lg opacity-75">View by station</p>
          </Link>

          <Link
            href="/mep/tomorrow"
            className="bg-[var(--success)] hover:opacity-90 text-white p-8 rounded-lg text-center transition-opacity"
          >
            <h2 className="text-2xl font-semibold mb-2">Tomorrow&apos;s MEP</h2>
            <p className="text-lg opacity-90">Print-ready list</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
