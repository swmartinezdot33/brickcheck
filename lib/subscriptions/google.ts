/**
 * Google Play Developer API Integration
 * 
 * Documentation: https://developers.google.com/android-publisher
 * 
 * Note: Requires 'googleapis' package. Install with: npm install googleapis
 */

// Dynamic import to handle missing package gracefully
let google: any = null
try {
  google = require('googleapis').google
} catch (error) {
  console.warn('googleapis package not installed. Google Play subscription features will not work.')
}

interface GoogleSubscriptionStatus {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'
  productId: string
  expiresAt: Date | null
  autoRenew: boolean
  purchaseToken: string
}

/**
 * Get authenticated Google Play Developer API client
 */
async function getGooglePlayClient() {
  const serviceAccountKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME

  if (!serviceAccountKey || !packageName) {
    throw new Error('Google Play API credentials not configured')
  }

  try {
    const credentials = JSON.parse(serviceAccountKey)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })

    const authClient = await auth.getClient()
    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: authClient as any,
    })

    return { androidPublisher, packageName }
  } catch (error) {
    console.error('Error initializing Google Play client:', error)
    throw new Error('Failed to initialize Google Play API client')
  }
}

/**
 * Fetch subscription status from Google Play Developer API
 */
export async function getGoogleSubscriptionStatus(
  purchaseToken: string,
  subscriptionId: string
): Promise<GoogleSubscriptionStatus | null> {
  try {
    if (!google) {
      throw new Error('googleapis package not installed. Please install it with: npm install googleapis')
    }
    const { androidPublisher, packageName } = await getGooglePlayClient()

    const response = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    })

    const subscription = response.data

    if (!subscription) {
      return null
    }

    // Map Google Play status to our status enum
    const statusMap: Record<number, 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'> = {
      0: 'ACTIVE', // Payment pending
      1: 'ACTIVE', // Active
      2: 'GRACE_PERIOD', // In grace period
      3: 'EXPIRED', // Expired
      4: 'CANCELED', // Canceled
    }

    const expiryTimeMillis = subscription.expiryTimeMillis
    const expiresAt = expiryTimeMillis ? new Date(parseInt(expiryTimeMillis)) : null

    return {
      status: statusMap[subscription.paymentState || 0] || 'EXPIRED',
      productId: subscriptionId,
      expiresAt,
      autoRenew: subscription.autoRenewing === true,
      purchaseToken,
    }
  } catch (error: any) {
    if (error.code === 404) {
      return null // Subscription not found
    }
    console.error('Error fetching Google subscription status:', error)
    throw error
  }
}


 * 
 * Documentation: https://developers.google.com/android-publisher
 * 
 * Note: Requires 'googleapis' package. Install with: npm install googleapis
 */

// Dynamic import to handle missing package gracefully
let google: any = null
try {
  google = require('googleapis').google
} catch (error) {
  console.warn('googleapis package not installed. Google Play subscription features will not work.')
}

interface GoogleSubscriptionStatus {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'
  productId: string
  expiresAt: Date | null
  autoRenew: boolean
  purchaseToken: string
}

/**
 * Get authenticated Google Play Developer API client
 */
async function getGooglePlayClient() {
  const serviceAccountKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME

  if (!serviceAccountKey || !packageName) {
    throw new Error('Google Play API credentials not configured')
  }

  try {
    const credentials = JSON.parse(serviceAccountKey)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })

    const authClient = await auth.getClient()
    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: authClient as any,
    })

    return { androidPublisher, packageName }
  } catch (error) {
    console.error('Error initializing Google Play client:', error)
    throw new Error('Failed to initialize Google Play API client')
  }
}

/**
 * Fetch subscription status from Google Play Developer API
 */
export async function getGoogleSubscriptionStatus(
  purchaseToken: string,
  subscriptionId: string
): Promise<GoogleSubscriptionStatus | null> {
  try {
    if (!google) {
      throw new Error('googleapis package not installed. Please install it with: npm install googleapis')
    }
    const { androidPublisher, packageName } = await getGooglePlayClient()

    const response = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    })

    const subscription = response.data

    if (!subscription) {
      return null
    }

    // Map Google Play status to our status enum
    const statusMap: Record<number, 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'> = {
      0: 'ACTIVE', // Payment pending
      1: 'ACTIVE', // Active
      2: 'GRACE_PERIOD', // In grace period
      3: 'EXPIRED', // Expired
      4: 'CANCELED', // Canceled
    }

    const expiryTimeMillis = subscription.expiryTimeMillis
    const expiresAt = expiryTimeMillis ? new Date(parseInt(expiryTimeMillis)) : null

    return {
      status: statusMap[subscription.paymentState || 0] || 'EXPIRED',
      productId: subscriptionId,
      expiresAt,
      autoRenew: subscription.autoRenewing === true,
      purchaseToken,
    }
  } catch (error: any) {
    if (error.code === 404) {
      return null // Subscription not found
    }
    console.error('Error fetching Google subscription status:', error)
    throw error
  }
}


 * 
 * Documentation: https://developers.google.com/android-publisher
 * 
 * Note: Requires 'googleapis' package. Install with: npm install googleapis
 */

// Dynamic import to handle missing package gracefully
let google: any = null
try {
  google = require('googleapis').google
} catch (error) {
  console.warn('googleapis package not installed. Google Play subscription features will not work.')
}

interface GoogleSubscriptionStatus {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'
  productId: string
  expiresAt: Date | null
  autoRenew: boolean
  purchaseToken: string
}

/**
 * Get authenticated Google Play Developer API client
 */
async function getGooglePlayClient() {
  const serviceAccountKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME

  if (!serviceAccountKey || !packageName) {
    throw new Error('Google Play API credentials not configured')
  }

  try {
    const credentials = JSON.parse(serviceAccountKey)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })

    const authClient = await auth.getClient()
    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: authClient as any,
    })

    return { androidPublisher, packageName }
  } catch (error) {
    console.error('Error initializing Google Play client:', error)
    throw new Error('Failed to initialize Google Play API client')
  }
}

/**
 * Fetch subscription status from Google Play Developer API
 */
export async function getGoogleSubscriptionStatus(
  purchaseToken: string,
  subscriptionId: string
): Promise<GoogleSubscriptionStatus | null> {
  try {
    if (!google) {
      throw new Error('googleapis package not installed. Please install it with: npm install googleapis')
    }
    const { androidPublisher, packageName } = await getGooglePlayClient()

    const response = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    })

    const subscription = response.data

    if (!subscription) {
      return null
    }

    // Map Google Play status to our status enum
    const statusMap: Record<number, 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'GRACE_PERIOD'> = {
      0: 'ACTIVE', // Payment pending
      1: 'ACTIVE', // Active
      2: 'GRACE_PERIOD', // In grace period
      3: 'EXPIRED', // Expired
      4: 'CANCELED', // Canceled
    }

    const expiryTimeMillis = subscription.expiryTimeMillis
    const expiresAt = expiryTimeMillis ? new Date(parseInt(expiryTimeMillis)) : null

    return {
      status: statusMap[subscription.paymentState || 0] || 'EXPIRED',
      productId: subscriptionId,
      expiresAt,
      autoRenew: subscription.autoRenewing === true,
      purchaseToken,
    }
  } catch (error: any) {
    if (error.code === 404) {
      return null // Subscription not found
    }
    console.error('Error fetching Google subscription status:', error)
    throw error
  }
}

