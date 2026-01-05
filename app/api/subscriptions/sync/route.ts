import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppleSubscriptionStatus } from '@/lib/subscriptions/apple'
import { getGoogleSubscriptionStatus } from '@/lib/subscriptions/google'

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    if (!dbSubscription) {
      return NextResponse.json(
        { error: 'No subscription found. Please link your app account first.' },
        { status: 404 }
      )
    }

    // Fetch fresh status from store API
    let freshStatus
    try {
      if (dbSubscription.platform === 'APPLE') {
        freshStatus = await getAppleSubscriptionStatus(dbSubscription.subscription_id)
      } else if (dbSubscription.platform === 'GOOGLE') {
        freshStatus = await getGoogleSubscriptionStatus(
          dbSubscription.subscription_id,
          dbSubscription.product_id
        )
      } else {
        return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
      }
    } catch (error) {
      console.error('Error fetching fresh subscription status:', error)
      return NextResponse.json(
        {
          error: 'Failed to sync subscription status',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    if (!freshStatus) {
      return NextResponse.json(
        { error: 'Subscription not found in store' },
        { status: 404 }
      )
    }

    // Update database with fresh status
    const { data: updatedSubscription, error: updateError } = await supabase
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
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      subscription: {
        platform: updatedSubscription.platform,
        productId: updatedSubscription.product_id,
        status: updatedSubscription.status,
        expiresAt: updatedSubscription.expires_at,
        autoRenew: updatedSubscription.auto_renew,
      },
      message: 'Subscription status synced successfully',
    })
  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


import { createClient } from '@/lib/supabase/server'
import { getAppleSubscriptionStatus } from '@/lib/subscriptions/apple'
import { getGoogleSubscriptionStatus } from '@/lib/subscriptions/google'

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    if (!dbSubscription) {
      return NextResponse.json(
        { error: 'No subscription found. Please link your app account first.' },
        { status: 404 }
      )
    }

    // Fetch fresh status from store API
    let freshStatus
    try {
      if (dbSubscription.platform === 'APPLE') {
        freshStatus = await getAppleSubscriptionStatus(dbSubscription.subscription_id)
      } else if (dbSubscription.platform === 'GOOGLE') {
        freshStatus = await getGoogleSubscriptionStatus(
          dbSubscription.subscription_id,
          dbSubscription.product_id
        )
      } else {
        return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
      }
    } catch (error) {
      console.error('Error fetching fresh subscription status:', error)
      return NextResponse.json(
        {
          error: 'Failed to sync subscription status',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    if (!freshStatus) {
      return NextResponse.json(
        { error: 'Subscription not found in store' },
        { status: 404 }
      )
    }

    // Update database with fresh status
    const { data: updatedSubscription, error: updateError } = await supabase
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
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      subscription: {
        platform: updatedSubscription.platform,
        productId: updatedSubscription.product_id,
        status: updatedSubscription.status,
        expiresAt: updatedSubscription.expires_at,
        autoRenew: updatedSubscription.auto_renew,
      },
      message: 'Subscription status synced successfully',
    })
  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


import { createClient } from '@/lib/supabase/server'
import { getAppleSubscriptionStatus } from '@/lib/subscriptions/apple'
import { getGoogleSubscriptionStatus } from '@/lib/subscriptions/google'

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    if (!dbSubscription) {
      return NextResponse.json(
        { error: 'No subscription found. Please link your app account first.' },
        { status: 404 }
      )
    }

    // Fetch fresh status from store API
    let freshStatus
    try {
      if (dbSubscription.platform === 'APPLE') {
        freshStatus = await getAppleSubscriptionStatus(dbSubscription.subscription_id)
      } else if (dbSubscription.platform === 'GOOGLE') {
        freshStatus = await getGoogleSubscriptionStatus(
          dbSubscription.subscription_id,
          dbSubscription.product_id
        )
      } else {
        return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
      }
    } catch (error) {
      console.error('Error fetching fresh subscription status:', error)
      return NextResponse.json(
        {
          error: 'Failed to sync subscription status',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }

    if (!freshStatus) {
      return NextResponse.json(
        { error: 'Subscription not found in store' },
        { status: 404 }
      )
    }

    // Update database with fresh status
    const { data: updatedSubscription, error: updateError } = await supabase
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
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      subscription: {
        platform: updatedSubscription.platform,
        productId: updatedSubscription.product_id,
        status: updatedSubscription.status,
        expiresAt: updatedSubscription.expires_at,
        autoRenew: updatedSubscription.auto_renew,
      },
      message: 'Subscription status synced successfully',
    })
  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}



