import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deposit Defender AI — UK Tenancy Deposit Dispute Assistant',
  description:
    'AI-powered RAG assistant that helps UK tenants challenge unfair landlord deposit deductions with evidence-backed dispute responses.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <nav className="fixed top-0 inset-x-0 z-50 px-6 py-3 flex items-center justify-between border-b border-white/10 bg-slate-950/80 backdrop-blur-md text-white">
          <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <span className="text-xl">🛡️</span>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Deposit Defender AI
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 text-sm">
            <Link href="/case/new" className="text-white/70 hover:text-white transition-colors px-2">
              New Case
            </Link>
            <Link
              href="/demo"
              className="rounded-lg bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 hover:bg-white/20 hover:border-white/40 transition-all font-medium"
            >
              Demo
            </Link>
          </div>
        </nav>
        <main className="flex-1 pt-14">{children}</main>
        <footer className="bg-black border-t border-white/10 py-6 px-6 text-center text-xs text-white/40">
          Deposit Defender AI — This tool does not provide legal advice. For complex cases contact Citizens Advice or Shelter.
        </footer>
      </body>
    </html>
  )
}
