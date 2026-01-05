import { NextRequest, NextResponse } from 'next/server'
import { RebrickableImporter } from '@/lib/catalog/importers/rebrickable-importer'

/**
 * Cron endpoint for catalog synchronization
 * Runs daily to update local LEGO set database
 * 
 * Secured with VERCEL_CRON_SECRET
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.VERCEL_CRON_SECRET

  if (!cronSecret) {
    console.error('[catalog-sync] VERCEL_CRON_SECRET not configured')
    return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[catalog-sync] Unauthorized cron request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[catalog-sync] Starting catalog synchronization...')

    // Import Rebrickable CSV data
    const importer = new RebrickableImporter()
    const result = await importer.import()

    console.log('[catalog-sync] Import complete:', {
      imported: result.imported,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length,
    })

    return NextResponse.json({
      success: true,
      result: {
        imported: result.imported,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors.length,
      },
    })
  } catch (error) {
    console.error('[catalog-sync] Error:', error)
    return NextResponse.json(
      {
        error: 'Catalog sync failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}



