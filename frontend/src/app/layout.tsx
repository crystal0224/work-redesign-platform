import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import ToastProvider from '@/components/providers/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Work Redesign Platform - SK Academy',
  description: 'AI-powered work redesign workshop tool for SK Group managers',
  keywords: ['work redesign', 'automation', 'AI', 'SK Group', 'workshop'],
  authors: [{ name: 'SK Academy' }],
  robots: 'noindex, nofollow', // Development only
  openGraph: {
    title: 'Work Redesign Platform',
    description: 'AI-powered work redesign workshop tool for SK Group managers',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-background">
            {children}
          </main>
          <Toaster />
          <ToastProvider />
        </Providers>
      </body>
    </html>
  )
}