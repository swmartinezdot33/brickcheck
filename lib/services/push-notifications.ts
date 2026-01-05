/**
 * Push Notifications Service
 * Handles registration and management of push notifications for mobile devices
 */

import { PushNotifications } from '@capacitor/push-notifications'
import { isCapacitorNative } from '@/lib/utils/capacitor'

/**
 * Register device for push notifications
 * Returns the device token if successful
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isCapacitorNative()) {
    console.log('Push notifications not available on web platform')
    return null
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied')
      return null
    }

    // Register with push service
    await PushNotifications.register()

    // Wait for registration to complete and return token
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value)
        resolve(token.value)
      })

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error))
        resolve(null)
      })
    })
  } catch (error) {
    console.error('Error registering for push notifications:', error)
    return null
  }
}

/**
 * Set up push notification listeners
 */
export function setupPushNotificationListeners() {
  if (!isCapacitorNative()) {
    return
  }

  // Handle notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received: ', JSON.stringify(notification))
    // You can show a custom in-app notification here
  })

  // Handle notification tapped/opened
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed', JSON.stringify(notification))
    // Handle navigation to relevant screen
  })
}

/**
 * Unregister from push notifications
 */
export async function unregisterFromPushNotifications() {
  if (!isCapacitorNative()) {
    return
  }

  try {
    await PushNotifications.unregister()
  } catch (error) {
    console.error('Error unregistering from push notifications:', error)
  }
}




