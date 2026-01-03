'use client'

import { useEffect } from 'react'
import { registerForPushNotifications, setupPushNotificationListeners } from '@/lib/services/push-notifications'
import { isCapacitorNative, getPlatform } from '@/lib/utils/capacitor'

/**
 * Provider component to set up push notifications
 * Should be added to the root layout
 */
export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isCapacitorNative()) {
      return
    }

    // Set up listeners
    setupPushNotificationListeners()

    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        const platform = getPlatform()
        if (platform === 'ios' || platform === 'android') {
          // Register token with backend
          fetch('/api/push/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              platform,
            }),
          }).catch((error) => {
            console.error('Error registering push token:', error)
          })
        }
      }
    })
  }, [])

  return <>{children}</>
}

