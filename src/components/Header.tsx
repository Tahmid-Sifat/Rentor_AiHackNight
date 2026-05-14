'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Header component - Sticky navigation bar visible on all pages
 * Features:
 * - Fixed at top with backdrop blur
 * - Shows breadcrumb navigation based on current route
 * - Logo/home link on left, action links on right
 * - Responsive: full text on desktop, compact on mobile
 */
export default function Header() {
  const pathname = usePathname()

  // Determine breadcrumb based on current route
  const getBreadcrumbs = () => {
    if (pathname === '/') {
      return { title: 'Home', path: '/' }
    }
    if (pathname.startsWith('/case/new')) {
      return { title: 'New Case', path: '/case/new' }
    }
    if (pathname.startsWith('/case/results')) {
      return { title: 'Results', path: '/case/results' }
    }
    if (pathname === '/demo') {
      return { title: 'Demo Case', path: '/demo' }
    }
    return { title: 'Rentor', path: '/' }
  }

  const breadcrumb = getBreadcrumbs()

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Logo - always links to home */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-sm sm:text-base flex-shrink-0"
            title="Back to home"
          >
            <span className="text-lg sm:text-xl">🛡️</span>
            <span className="hidden sm:inline bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent whitespace-nowrap">
              Rentor
            </span>
            <span className="sm:hidden bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Rentor
            </span>
          </Link>

          {/* Breadcrumb divider - shows on non-home pages */}
          {pathname !== '/' && (
            <>
              <div className="text-white/30 hidden sm:block">/</div>
              <span className="text-white/60 text-sm hidden sm:inline">{breadcrumb.title}</span>
            </>
          )}
        </div>

        {/* Right: Action Links */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-shrink-0 ml-4">
          {/* New Case link - hidden if already on New Case page */}
          {pathname !== '/case/new' && (
            <Link
              href="/case/new"
              className="text-white/70 hover:text-white transition-colors px-2 py-1 rounded whitespace-nowrap"
              title="Start a new dispute case"
            >
              New Case
            </Link>
          )}

          {/* Demo link - hidden if already on Demo page */}
          {pathname !== '/demo' && (
            <Link
              href="/demo"
              className="rounded-lg bg-white/10 border border-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 hover:bg-white/20 hover:border-white/40 transition-all font-medium text-white whitespace-nowrap"
              title="View demo case"
            >
              Demo
            </Link>
          )}

          {/* Home link - shown on non-home pages */}
          {pathname !== '/' && (
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors px-2 py-1 rounded whitespace-nowrap text-xs"
              title="Back to home"
            >
              Home
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
