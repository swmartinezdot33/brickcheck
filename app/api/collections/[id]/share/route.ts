import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
    }

    // Verify the collection belongs to the user
    const { data: collection, error: fetchError } = await supabase
      .from('collections')
      .select('id, share_token, is_public')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Generate a new token if one doesn't exist, otherwise reuse existing
    let shareToken = collection.share_token

    if (!shareToken) {
      // Generate a cryptographically secure random token (32 bytes = 64 hex characters)
      shareToken = randomBytes(32).toString('hex')
    }

    // Update collection to be public with the share token
    const { data: updatedCollection, error: updateError } = await supabase
      .from('collections')
      .update({
        share_token: shareToken,
        is_public: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating collection:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Generate the full shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const shareUrl = `${baseUrl}/share/${shareToken}`

    return NextResponse.json({
      shareToken,
      shareUrl,
      isPublic: updatedCollection.is_public,
    })
  } catch (error) {
    console.error('Error generating share link:', error)
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify the collection belongs to the user
    const { data: collection, error: fetchError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Revoke sharing by setting is_public to false
    // Optionally regenerate token for security, but for simplicity we'll just disable it
    const { error: updateError } = await supabase
      .from('collections')
      .update({
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error revoking share link:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    )
  }
}

