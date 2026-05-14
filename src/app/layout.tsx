import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentor - UK Tenancy Deposit Dispute Assistant',
  description:
    'AI-powered RAG assistant that helps UK tenants challenge unfair landlord deposit deductions with evidence-backed dispute responses.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 pt-14">{children}</main>
        <footer className="bg-black border-t border-white/10 py-6 px-6 text-center text-xs text-white/40">
          Rentor - This tool does not provide legal advice. For complex cases contact Citizens Advice or Shelter.
        </footer>
      </body>
    </html>
  )
}
