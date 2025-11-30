import Link from 'next/link';
import Card from './components/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-300">
        <div className="container flex-between py-6">
          <h1 className="text-5xl font-black tracking-tight text-[var(--foreground)]">MISE PLEASE</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)]">Kitchen Prep Management</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="section">
        <div className="container">
          {/* Hero Section */}
          <div className="mb-20">
            <h2 className="text-6xl font-black mb-6 text-[var(--foreground)]">
              Organize Your <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Kitchen Prep
              </span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Streamline daily prep tasks by station. Create, track, and print mise en place lists
              in seconds.
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Add Task - Primary Action */}
            <Link href="/add" className="group">
              <Card gradient gradientType="vibrant" size="lg">
                <div className="text-center">
                  <div className="text-4xl mb-4 font-black">✚</div>
                  <h3 className="text-2xl font-black mb-2 group-hover:translate-y-1 transition-transform">
                    Add Task
                  </h3>
                  <p className="text-sm opacity-90">Create a new prep task</p>
                </div>
              </Card>
            </Link>

            {/* Overview */}
            <Link href="/overview" className="group">
              <Card size="lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-2xl font-black mb-2 group-hover:translate-y-1 transition-transform text-[var(--foreground)]">
                    Overview
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">View all tasks by station</p>
                </div>
              </Card>
            </Link>

            {/* Stations */}
            <Link href="/stations" className="group">
              <Card size="lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏪</div>
                  <h3 className="text-2xl font-black mb-2 group-hover:translate-y-1 transition-transform text-[var(--foreground)]">
                    Stations
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">Browse by station</p>
                </div>
              </Card>
            </Link>

            {/* Tomorrow's MEP */}
            <Link href="/mep/tomorrow" className="group">
              <Card gradient gradientType="cool" size="lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">🖨️</div>
                  <h3 className="text-2xl font-black mb-2 group-hover:translate-y-1 transition-transform">
                    Print MEP
                  </h3>
                  <p className="text-sm opacity-90">Tomorrow&apos;s prep list</p>
                </div>
              </Card>
            </Link>
          </div>

          {/* Info Section */}
          <div className="mt-20 pt-16 border-t-2 border-[var(--border)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-3xl font-black mb-3 text-[var(--foreground)]">Fast</h4>
                <p className="text-[var(--text-secondary)]">Add tasks in seconds. No complex forms, just pure functionality.</p>
              </div>
              <div>
                <h4 className="text-3xl font-black mb-3 text-[var(--foreground)]">Smart</h4>
                <p className="text-[var(--text-secondary)]">Tasks organize by station with priority levels and target dates.</p>
              </div>
              <div>
                <h4 className="text-3xl font-black mb-3 text-[var(--foreground)]">Printable</h4>
                <p className="text-[var(--text-secondary)]">Generate mise en place lists ready for the kitchen wall.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
