'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, Smartphone, Apple } from 'lucide-react'
import { format } from 'date-fns'

interface Subscription {
  platform: 'APPLE' | 'GOOGLE'
  productId: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'
  expiresAt: string | null
  autoRenew: boolean
}

export function SubscriptionStatus() {
  const queryClient = useQueryClient()

  // Fetch subscription status
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/status')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch subscription status')
      }
      const data = await res.json()
      return data.subscription as Subscription | null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscriptions/sync', {
        method: 'POST',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to sync subscription')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'CANCELED':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        )
      case 'GRACE_PERIOD':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Grace Period
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'APPLE' ? (
      <Apple className="h-5 w-5" />
    ) : (
      <Smartphone className="h-5 w-5" />
    )
  }

  const getPlanName = (productId: string) => {
    if (productId.includes('annual') || productId.includes('year')) {
      return 'Annual Plan'
    }
    if (productId.includes('monthly') || productId.includes('month')) {
      return 'Monthly Plan'
    }
    return productId
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading subscription status...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-red-50/30 to-transparent dark:from-red-950/20">
        <CardContent className="p-12 text-center">
          <p className="text-red-500 mb-2">Error loading subscription</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription. Download the app and subscribe to get started.
            </p>
            <Button asChild>
              <a
                href="https://apps.apple.com/app/brickcheck"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Apple className="h-4 w-4" />
                Get Started
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current subscription plan and status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {getStatusBadge(data.status)}
          <div className="flex items-center gap-2 text-muted-foreground">
            {getPlatformIcon(data.platform)}
            <span className="text-sm capitalize">{data.platform.toLowerCase()}</span>
          </div>
        </div>

        {/* Plan Name */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Plan</p>
          <p className="text-lg font-semibold">{getPlanName(data.productId)}</p>
        </div>

        {/* Expiration Date */}
        {data.expiresAt && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Expires</p>
            <p className="text-lg">
              {format(new Date(data.expiresAt), 'PPpp')}
            </p>
          </div>
        )}

        {/* Auto-renew Status */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Auto-renew</p>
          <div className="flex items-center gap-2">
            {data.autoRenew ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Enabled</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Disabled</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Status Message */}
        {syncMutation.isSuccess && (
          <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded">
            Subscription status refreshed successfully!
          </div>
        )}

        {syncMutation.isError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
            {syncMutation.error instanceof Error
              ? syncMutation.error.message
              : 'Failed to sync subscription status'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, Smartphone, Apple } from 'lucide-react'
import { format } from 'date-fns'

interface Subscription {
  platform: 'APPLE' | 'GOOGLE'
  productId: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'
  expiresAt: string | null
  autoRenew: boolean
}

export function SubscriptionStatus() {
  const queryClient = useQueryClient()

  // Fetch subscription status
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/status')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch subscription status')
      }
      const data = await res.json()
      return data.subscription as Subscription | null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscriptions/sync', {
        method: 'POST',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to sync subscription')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'CANCELED':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        )
      case 'GRACE_PERIOD':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Grace Period
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'APPLE' ? (
      <Apple className="h-5 w-5" />
    ) : (
      <Smartphone className="h-5 w-5" />
    )
  }

  const getPlanName = (productId: string) => {
    if (productId.includes('annual') || productId.includes('year')) {
      return 'Annual Plan'
    }
    if (productId.includes('monthly') || productId.includes('month')) {
      return 'Monthly Plan'
    }
    return productId
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading subscription status...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-red-50/30 to-transparent dark:from-red-950/20">
        <CardContent className="p-12 text-center">
          <p className="text-red-500 mb-2">Error loading subscription</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription. Download the app and subscribe to get started.
            </p>
            <Button asChild>
              <a
                href="https://apps.apple.com/app/brickcheck"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Apple className="h-4 w-4" />
                Get Started
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current subscription plan and status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {getStatusBadge(data.status)}
          <div className="flex items-center gap-2 text-muted-foreground">
            {getPlatformIcon(data.platform)}
            <span className="text-sm capitalize">{data.platform.toLowerCase()}</span>
          </div>
        </div>

        {/* Plan Name */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Plan</p>
          <p className="text-lg font-semibold">{getPlanName(data.productId)}</p>
        </div>

        {/* Expiration Date */}
        {data.expiresAt && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Expires</p>
            <p className="text-lg">
              {format(new Date(data.expiresAt), 'PPpp')}
            </p>
          </div>
        )}

        {/* Auto-renew Status */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Auto-renew</p>
          <div className="flex items-center gap-2">
            {data.autoRenew ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Enabled</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Disabled</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Status Message */}
        {syncMutation.isSuccess && (
          <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded">
            Subscription status refreshed successfully!
          </div>
        )}

        {syncMutation.isError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
            {syncMutation.error instanceof Error
              ? syncMutation.error.message
              : 'Failed to sync subscription status'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, Smartphone, Apple } from 'lucide-react'
import { format } from 'date-fns'

interface Subscription {
  platform: 'APPLE' | 'GOOGLE'
  productId: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'
  expiresAt: string | null
  autoRenew: boolean
}

export function SubscriptionStatus() {
  const queryClient = useQueryClient()

  // Fetch subscription status
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/status')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch subscription status')
      }
      const data = await res.json()
      return data.subscription as Subscription | null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscriptions/sync', {
        method: 'POST',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to sync subscription')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case 'CANCELED':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        )
      case 'GRACE_PERIOD':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Grace Period
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'APPLE' ? (
      <Apple className="h-5 w-5" />
    ) : (
      <Smartphone className="h-5 w-5" />
    )
  }

  const getPlanName = (productId: string) => {
    if (productId.includes('annual') || productId.includes('year')) {
      return 'Annual Plan'
    }
    if (productId.includes('monthly') || productId.includes('month')) {
      return 'Monthly Plan'
    }
    return productId
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading subscription status...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-red-50/30 to-transparent dark:from-red-950/20">
        <CardContent className="p-12 text-center">
          <p className="text-red-500 mb-2">Error loading subscription</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20">
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription. Download the app and subscribe to get started.
            </p>
            <Button asChild>
              <a
                href="https://apps.apple.com/app/brickcheck"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Apple className="h-4 w-4" />
                Get Started
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current subscription plan and status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {getStatusBadge(data.status)}
          <div className="flex items-center gap-2 text-muted-foreground">
            {getPlatformIcon(data.platform)}
            <span className="text-sm capitalize">{data.platform.toLowerCase()}</span>
          </div>
        </div>

        {/* Plan Name */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Plan</p>
          <p className="text-lg font-semibold">{getPlanName(data.productId)}</p>
        </div>

        {/* Expiration Date */}
        {data.expiresAt && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Expires</p>
            <p className="text-lg">
              {format(new Date(data.expiresAt), 'PPpp')}
            </p>
          </div>
        )}

        {/* Auto-renew Status */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Auto-renew</p>
          <div className="flex items-center gap-2">
            {data.autoRenew ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Enabled</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Disabled</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Status Message */}
        {syncMutation.isSuccess && (
          <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded">
            Subscription status refreshed successfully!
          </div>
        )}

        {syncMutation.isError && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
            {syncMutation.error instanceof Error
              ? syncMutation.error.message
              : 'Failed to sync subscription status'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



