'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Package, Scan, Settings, LogOut, Search } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              BrickCheck
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/browse"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all"
              >
                <Search className="h-4 w-4" />
                Browse
              </Link>
              <Link
                href="/collection"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all"
              >
                <Package className="h-4 w-4" />
                Collection
              </Link>
              <Link
                href="/scan"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all"
              >
                <Scan className="h-4 w-4" />
                Scan
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-all"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}

