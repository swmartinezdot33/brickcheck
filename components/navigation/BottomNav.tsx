'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, Search, Scan, Package, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  activeMatch: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutGrid className="h-5 w-5" />,
    activeMatch: (p) => p === '/dashboard',
  },
  {
    href: '/browse',
    label: 'Search',
    icon: <Search className="h-5 w-5" />,
    activeMatch: (p) => p.startsWith('/browse'),
  },
  {
    href: '/scan',
    label: 'Scan',
    icon: <Scan className="h-5 w-5" />,
    activeMatch: (p) => p.startsWith('/scan'),
  },
  {
    href: '/collection',
    label: 'Collection',
    icon: <Package className="h-5 w-5" />,
    activeMatch: (p) => p === '/collection',
  },
  {
    href: '/account',
    label: 'Account',
    icon: <Settings className="h-5 w-5" />,
    activeMatch: (p) => p === '/account' || p === '/settings',
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Hide bottom nav on full-screen scanner page
  const hideNav = pathname === '/scan'

  if (hideNav) return null

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md md:hidden z-40'
      )}
    >
      <div className="flex items-center justify-around h-16 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = item.activeMatch(pathname)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center h-full flex-1 gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-lg blur-md" />
                )}
                <div className={cn(
                  'p-2 rounded-lg transition-colors',
                  isActive && 'bg-primary/10'
                )}>
                  {item.icon}
                </div>
              </div>
              <span className="text-xs font-medium text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
