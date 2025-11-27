import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import ThemeToggle from './components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Mise Please',
  description: 'Kitchen prep task management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          {/* Floating theme toggle - positioned in bottom right */}
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
