'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Apple, Smartphone, ExternalLink, AlertTriangle } from 'lucide-react'

interface SubscriptionInstructionsProps {
  platform?: 'APPLE' | 'GOOGLE' | null
}

export function SubscriptionInstructions({ platform }: SubscriptionInstructionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const appleUpgradeSteps = [
    'Open the App Store on your iPhone or iPad',
    'Tap your profile icon in the top right corner',
    'Tap "Subscriptions"',
    'Find "BrickCheck" in your active subscriptions',
    'Tap "BrickCheck" to view subscription options',
    'Select "Annual Plan" and confirm the upgrade',
    'Your subscription will switch to annual billing at your next renewal date',
  ]

  const appleCancelSteps = [
    'Open the App Store on your iPhone or iPad',
    'Tap your profile icon in the top right corner',
    'Tap "Subscriptions"',
    'Find "BrickCheck" in your active subscriptions',
    'Tap "BrickCheck"',
    'Tap "Cancel Subscription"',
    'Confirm cancellation',
    'Note: You\'ll continue to have access until the end of your current billing period',
  ]

  const googleUpgradeSteps = [
    'Open the Google Play Store app on your Android device',
    'Tap the menu icon (three horizontal lines) in the top left',
    'Tap "Subscriptions"',
    'Find "BrickCheck" in your subscriptions list',
    'Tap "BrickCheck"',
    'Tap "Manage" or "Change plan"',
    'Select "Annual Plan"',
    'Confirm the upgrade',
    'Your subscription will switch to annual billing at your next renewal date',
  ]

  const googleCancelSteps = [
    'Open the Google Play Store app on your Android device',
    'Tap the menu icon (three horizontal lines) in the top left',
    'Tap "Subscriptions"',
    'Find "BrickCheck" in your subscriptions list',
    'Tap "BrickCheck"',
    'Tap "Cancel subscription"',
    'Follow the prompts to confirm cancellation',
    'Note: You\'ll continue to have access until the end of your current billing period',
  ]

  const getUpgradeSteps = () => {
    if (platform === 'APPLE') return appleUpgradeSteps
    if (platform === 'GOOGLE') return googleUpgradeSteps
    return [...appleUpgradeSteps, ...googleUpgradeSteps] // Show both if platform unknown
  }

  const getCancelSteps = () => {
    if (platform === 'APPLE') return appleCancelSteps
    if (platform === 'GOOGLE') return googleCancelSteps
    return [...appleCancelSteps, ...googleCancelSteps] // Show both if platform unknown
  }

  const getStoreLink = () => {
    if (platform === 'APPLE') {
      return 'https://apps.apple.com/account/subscriptions'
    }
    if (platform === 'GOOGLE') {
      return 'https://play.google.com/store/account/subscriptions'
    }
    return null
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20">
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Learn how to upgrade to annual plan or cancel your subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Direct Link to Store */}
        {getStoreLink() && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Quick Access</p>
            <Button asChild variant="outline" className="w-full">
              <a
                href={getStoreLink() || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                {platform === 'APPLE' ? (
                  <>
                    <Apple className="h-4 w-4" />
                    Open App Store Subscriptions
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    Open Google Play Subscriptions
                  </>
                )}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        )}

        {/* Upgrade to Annual Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('upgrade')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold">$</span>
              </div>
              <div>
                <p className="font-semibold">Upgrade to Annual Plan</p>
                <p className="text-sm text-muted-foreground">
                  Save money with annual billing
                </p>
              </div>
            </div>
            {expandedSection === 'upgrade' ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === 'upgrade' && (
            <div className="p-4 pt-0 border-t">
              <ol className="space-y-3 list-decimal list-inside">
                {getUpgradeSteps().map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
              {platform && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Upgrading to annual will take effect at your next billing
                    cycle. You'll receive a prorated credit for the remaining time on your current plan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cancel Subscription Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('cancel')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  Stop auto-renewal and cancel your subscription
                </p>
              </div>
            </div>
            {expandedSection === 'cancel' ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {expandedSection === 'cancel' && (
            <div className="p-4 pt-0 border-t">
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> Canceling your subscription will stop auto-renewal.
                  You'll continue to have access to all features until the end of your current
                  billing period.
                </p>
              </div>
              <ol className="space-y-3 list-decimal list-inside">
                {getCancelSteps().map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Need help?</strong> If you're having trouble canceling, you can also
                  contact support through the app or email us at support@brickcheck.app
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Platform-specific note */}
        {!platform && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Instructions vary by platform. If you subscribed through the
              App Store (iOS), follow the Apple steps. If you subscribed through Google Play
              (Android), follow the Google steps.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

