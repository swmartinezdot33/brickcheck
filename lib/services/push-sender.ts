/**
 * Push Notification Sender
 * Handles sending push notifications via FCM (Android) and APNs (iOS)
 */

import { createClient } from '@/lib/supabase/server'
import admin from 'firebase-admin'
import apn from 'apn'

// Initialize Firebase Admin (will be initialized on first use)
let firebaseApp: admin.app.App | null = null

// Initialize APNs provider (will be initialized on first use)
let apnProvider: apn.Provider | null = null

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase(): admin.app.App | null {
  if (firebaseApp) {
    return firebaseApp
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not configured, FCM notifications disabled')
    return null
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson)
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
    return firebaseApp
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
    return null
  }
}

/**
 * Initialize APNs provider
 */
function initializeAPNs(): apn.Provider | null {
  if (apnProvider) {
    return apnProvider
  }

  const apnsKeyId = process.env.APNS_KEY_ID
  const apnsTeamId = process.env.APNS_TEAM_ID
  const apnsKey = process.env.APNS_KEY // Base64 encoded key
  const apnsBundleId = process.env.APNS_BUNDLE_ID || 'com.brickcheck.app'
  const isProduction = process.env.NODE_ENV === 'production'

  if (!apnsKeyId || !apnsTeamId || !apnsKey) {
    console.warn('APNs credentials not configured, iOS notifications disabled')
    return null
  }

  try {
    // Decode base64 key if needed
    const keyBuffer = Buffer.from(apnsKey, 'base64')

    apnProvider = new apn.Provider({
      token: {
        key: keyBuffer,
        keyId: apnsKeyId,
        teamId: apnsTeamId,
      },
      production: isProduction,
    })

    return apnProvider
  } catch (error) {
    console.error('Failed to initialize APNs provider:', error)
    return null
  }
}

/**
 * Send push notification to a single device
 */
export async function sendPushNotification(
  token: string,
  platform: 'ios' | 'android',
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  if (platform === 'android') {
    return sendFCMNotification(token, title, body, data)
  } else {
    return sendAPNsNotification(token, title, body, data)
  }
}

/**
 * Send FCM notification (Android)
 */
async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  const app = initializeFirebase()
  if (!app) {
    return false
  }

  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'alerts',
        },
      },
    }

    const response = await admin.messaging().send(message)
    console.log('Successfully sent FCM message:', response)
    return true
  } catch (error) {
    console.error('Error sending FCM notification:', error)
    return false
  }
}

/**
 * Send APNs notification (iOS)
 */
async function sendAPNsNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  const provider = initializeAPNs()
  if (!provider) {
    return false
  }

  try {
    const notification = new apn.Notification()
    notification.alert = { title, body }
    notification.sound = 'default'
    notification.badge = 1
    notification.topic = process.env.APNS_BUNDLE_ID || 'com.brickcheck.app'
    notification.payload = data || {}
    notification.priority = 10
    notification.pushType = 'alert'

    const result = await provider.send(notification, token)
    
    if (result.failed && result.failed.length > 0) {
      console.error('Failed to send APNs notification:', result.failed)
      return false
    }

    console.log('Successfully sent APNs notification')
    return true
  } catch (error) {
    console.error('Error sending APNs notification:', error)
    return false
  }
}

/**
 * Send push notification to all devices for a user
 */
export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ sent: number; failed: number }> {
  const supabase = await createClient()
  
  // Get all push tokens for this user
  const { data: tokens, error } = await supabase
    .from('push_tokens')
    .select('token, platform')
    .eq('user_id', userId)

  if (error || !tokens || tokens.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  // Send to all tokens
  for (const { token, platform } of tokens) {
    const success = await sendPushNotification(token, platform as 'ios' | 'android', title, body, data)
    if (success) {
      sent++
    } else {
      failed++
    }
  }

  return { sent, failed }
}

