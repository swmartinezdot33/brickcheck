'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Package, Settings, LogOut, Search, Menu, X, User } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only using pathname after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/browse', icon: Search, label: 'Browse' },
    { href: '/collection', icon: Package, label: 'Collection' },
    { href: '/account', icon: User, label: 'Account' },
  ]

  // Hide navbar on scan page
  if (pathname === '/scan') return null

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                BrickCheck
              </Link>
              
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = mounted && pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        isActive
                          ? 'text-foreground bg-accent'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut} 
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = mounted && pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all ${
                          isActive
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </nav>
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

