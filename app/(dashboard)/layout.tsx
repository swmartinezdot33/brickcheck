import { Navbar } from '@/components/navigation/Navbar'
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
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-blue-50/20 to-green-50/30 dark:from-gray-900 dark:via-purple-900/10">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:block">{children}</main>
    </div>
  )
}

