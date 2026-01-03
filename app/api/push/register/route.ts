import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
})

/**
 * Register a device token for push notifications
 * POST /api/push/register
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = registerTokenSchema.parse(body)

    // Store or update device token in database
    const { data, error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: user.id,
          token: validated.token,
          platform: validated.platform,
        },
        {
          onConflict: 'user_id,token,platform',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error storing push token:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Device registered for push notifications', data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error registering push token:', error)
    return NextResponse.json(
      { error: 'Failed to register push token', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

