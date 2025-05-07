import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GradientsBg } from '@/components/gradients-bg'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Persona Analytics Dashboard',
  description: 'Analytics dashboard for COVID-19 persona responses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GradientsBg />
        <main className="relative bg-transparent scroll-smooth">
          {children}
        </main>
      </body>
    </html>
  )
}
