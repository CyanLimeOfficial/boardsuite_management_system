// =================================================================================
// FILE: src/app/layout.tsx
// EXPLANATION: This is the root layout. It sets up the basic HTML structure.
// =================================================================================
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boarding House Management',
  description: 'Dashboard for managing a boarding house',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}