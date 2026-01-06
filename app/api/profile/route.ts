import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  avatar_url: z.string().url().optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      // If table doesn't exist, return empty profile (migrations may not have run)
      if (profileError.code === '42P01' || profileError.message?.includes('does not exist')) {
        console.warn('user_profiles table does not exist. Please run migrations.')
        return NextResponse.json({
          profile: {
            id: user.id,
            email: user.email,
            display_name: null,
            avatar_url: null,
            phone: null,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        })
      }
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Return combined profile data
    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        phone: profile?.phone || null,
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at || user.updated_at,
      },
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { display_name, avatar_url, phone } = validation.data

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (display_name !== undefined) {
      updateData.display_name = display_name || null
    }
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url
    }
    if (phone !== undefined) {
      updateData.phone = phone || null
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let result

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            display_name: display_name || null,
            avatar_url: avatar_url || null,
            phone: phone || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()
    }

    const { data: profile, error: updateError } = result

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        phone: profile?.phone || null,
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
