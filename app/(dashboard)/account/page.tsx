'use client'

import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SubscriptionStatus } from '@/components/account/SubscriptionStatus'
import { SubscriptionInstructions } from '@/components/account/SubscriptionInstructions'
import { User, CreditCard } from 'lucide-react'

export default function AccountPage() {
  // Fetch subscription to determine platform for instructions
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/subscriptions/status')
        if (!res.ok) return null
        const data = await res.json()
        return data.subscription
      } catch (error) {
        console.error('Error fetching subscription status:', error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on error to avoid blocking page load
  })

  const platform = subscriptionData?.platform || null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Account
        </h1>
        <p className="text-muted-foreground">Manage your profile and subscription settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionStatus />
          <SubscriptionInstructions platform={platform} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SubscriptionStatus } from '@/components/account/SubscriptionStatus'
import { SubscriptionInstructions } from '@/components/account/SubscriptionInstructions'
import { User, CreditCard } from 'lucide-react'

export default function AccountPage() {
  // Fetch subscription to determine platform for instructions
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/subscriptions/status')
        if (!res.ok) return null
        const data = await res.json()
        return data.subscription
      } catch (error) {
        console.error('Error fetching subscription status:', error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on error to avoid blocking page load
  })

  const platform = subscriptionData?.platform || null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Account
        </h1>
        <p className="text-muted-foreground">Manage your profile and subscription settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionStatus />
          <SubscriptionInstructions platform={platform} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SubscriptionStatus } from '@/components/account/SubscriptionStatus'
import { SubscriptionInstructions } from '@/components/account/SubscriptionInstructions'
import { User, CreditCard } from 'lucide-react'

export default function AccountPage() {
  // Fetch subscription to determine platform for instructions
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/subscriptions/status')
        if (!res.ok) return null
        const data = await res.json()
        return data.subscription
      } catch (error) {
        console.error('Error fetching subscription status:', error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on error to avoid blocking page load
  })

  const platform = subscriptionData?.platform || null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Account
        </h1>
        <p className="text-muted-foreground">Manage your profile and subscription settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionStatus />
          <SubscriptionInstructions platform={platform} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

