import { BottomNav } from '@/components/navigation/BottomNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-blue-50/20 to-green-50/30 dark:from-gray-900 dark:via-purple-900/10 flex flex-col">
      {/* Main content area with padding for mobile bottom nav */}
      <main className="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8">
        {children}
      </main>
      
      {/* Bottom navigation (mobile only) */}
      <BottomNav />
    </div>
  )
}
