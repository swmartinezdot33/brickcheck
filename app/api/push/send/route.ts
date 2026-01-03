import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushNotificationToUser } from '@/lib/services/push-sender'
import { z } from 'zod'

const sendNotificationSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.any()).optional(),
})

/**
 * Send push notification to a user
 * POST /api/push/send
 * 
 * Note: This endpoint should be secured (e.g., require service role or API key)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from authorized source (e.g., service role or API key)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.VERCEL_CRON_SECRET
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Allow service role key or cron secret
    const isAuthorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`)

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = sendNotificationSchema.parse(body)

    const result = await sendPushNotificationToUser(
      validated.user_id,
      validated.title,
      validated.body,
      validated.data
    )

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.issues }, { status: 400 })
    }
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Failed to send push notification', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

