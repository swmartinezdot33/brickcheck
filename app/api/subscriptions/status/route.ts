import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppleSubscriptionStatus } from '@/lib/subscriptions/apple'
import { getGoogleSubscriptionStatus } from '@/lib/subscriptions/google'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stored subscription from database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (dbError) {
      console.error('Error fetching subscription from database:', dbError)
    }

    // If no subscription in database, return null
    if (!dbSubscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No subscription found. Please link your app account.',
      })
    }

    // Check if cached data is still fresh (5 minutes)
    const cacheAge = dbSubscription.updated_at
      ? Date.now() - new Date(dbSubscription.updated_at).getTime()
      : Infinity
    const fiveMinutes = 5 * 60 * 1000

    // If cache is fresh, return cached data
    if (cacheAge < fiveMinutes && dbSubscription.status !== 'EXPIRED') {
      return NextResponse.json({
        subscription: {
          platform: dbSubscription.platform,
          productId: dbSubscription.product_id,
          status: dbSubscription.status,
          expiresAt: dbSubscription.expires_at,
          autoRenew: dbSubscription.auto_renew,
        },
        cached: true,
      })
    }

    // Fetch fresh status from store API
    let freshStatus
    try {
      if (dbSubscription.platform === 'APPLE') {
        freshStatus = await getAppleSubscriptionStatus(dbSubscription.subscription_id)
      } else if (dbSubscription.platform === 'GOOGLE') {
        // For Google, we need subscription_id (product ID) and subscription_id (purchase token)
        // The subscription_id field stores the purchase token for Google
        freshStatus = await getGoogleSubscriptionStatus(
          dbSubscription.subscription_id,
          dbSubscription.product_id
        )
      }
    } catch (error) {
      console.error('Error fetching fresh subscription status:', error)
      // Return cached data if API fails
      return NextResponse.json({
        subscription: {
          platform: dbSubscription.platform,
          productId: dbSubscription.product_id,
          status: dbSubscription.status,
          expiresAt: dbSubscription.expires_at,
          autoRenew: dbSubscription.auto_renew,
        },
        cached: true,
        error: 'Failed to refresh status from store',
      })
    }

    // Update database with fresh status
    if (freshStatus) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: freshStatus.status,
          expires_at: freshStatus.expiresAt?.toISOString() || null,
          auto_renew: freshStatus.autoRenew,
          updated_at: new Date().toISOString(),
          raw_data: freshStatus as any,
        })
        .eq('user_id', user.id)
        .eq('platform', dbSubscription.platform)

      if (updateError) {
        console.error('Error updating subscription status:', updateError)
      }
    }

    return NextResponse.json({
      subscription: freshStatus
        ? {
            platform: dbSubscription.platform,
            productId: freshStatus.productId,
            status: freshStatus.status,
            expiresAt: freshStatus.expiresAt,
            autoRenew: freshStatus.autoRenew,
          }
        : {
            platform: dbSubscription.platform,
            productId: dbSubscription.product_id,
            status: dbSubscription.status,
            expiresAt: dbSubscription.expires_at,
            autoRenew: dbSubscription.auto_renew,
          },
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


