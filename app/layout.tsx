import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
