import { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ShareCollectionContent from './ShareCollectionContent'

// Generate metadata for the share page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  
  try {
    const supabase = await createClient()
    
    // Fetch collection data for metadata
    const { data: collection } = await supabase
      .from('collections')
      .select('name, description, user_id')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (!collection) {
      return {
        title: 'Collection Not Found | BrickCheck',
        description: 'This shared collection is not available or has been removed.',
      }
    }

    // Fetch user display name
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', collection.user_id)
      .single()

    // Fetch item count for description
    const { count } = await supabase
      .from('user_collection_items')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collection.id)

    const itemCount = count || 0
    const ownerName = userProfile?.display_name || 'a collector'
    const collectionName = collection.name
    const description = collection.description || `Check out this LEGO collection on BrickCheck`
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.brickcheck.app'
    const shareUrl = `${siteUrl}/share/${token}`
    
    const title = `${collectionName} - Shared LEGO Collection | BrickCheck`
    const metaDescription = `${collectionName}${collection.description ? `: ${collection.description}` : ''} • ${itemCount} ${itemCount === 1 ? 'set' : 'sets'} • Shared by ${ownerName} on BrickCheck`

    return {
      title,
      description: metaDescription,
      openGraph: {
        title,
        description: metaDescription,
        url: shareUrl,
        siteName: 'BrickCheck',
        type: 'website',
        images: [
          {
            url: '/BrickCheckLogo.png',
            width: 1200,
            height: 630,
            alt: `${collectionName} - Shared LEGO Collection on BrickCheck`,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: metaDescription,
        images: ['/BrickCheckLogo.png'],
        creator: '@brickcheckapp',
        site: '@brickcheckapp',
      },
      alternates: {
        canonical: shareUrl,
      },
      robots: {
        index: false, // Don't index shared collection pages
        follow: true,
      },
    }
  } catch (error) {
    console.error('Error generating metadata for share page:', error)
    return {
      title: 'Shared Collection | BrickCheck',
      description: 'View a shared LEGO collection on BrickCheck',
    }
  }
}

export default async function ShareCollectionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading collection...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ShareCollectionContent token={token} />
    </Suspense>
  )
}
