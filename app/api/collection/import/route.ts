import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCatalogProvider } from '@/lib/providers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const importType = formData.get('type') as string
    const collectionId = formData.get('collectionId') as string | null

    if (!importType || !['rebrickable', 'lugnet', 'csv'].includes(importType)) {
      return NextResponse.json({ error: 'Invalid import type' }, { status: 400 })
    }

    let setsToImport: Array<{
      set_number: string
      quantity?: number
      condition?: 'SEALED' | 'USED'
    }> = []

    // Get default collection if no collectionId provided
    let targetCollectionId = collectionId
    if (!targetCollectionId) {
      const { data: collections } = await supabase
        .from('collections')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (collections) {
        targetCollectionId = collections.id
      } else {
        // Create default collection
        const { data: newCollection, error: createError } = await supabase
          .from('collections')
          .insert({
            user_id: user.id,
            name: 'My Collection',
          })
          .select('id')
          .single()

        if (createError) {
          return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
        }
        targetCollectionId = newCollection.id
      }
    }

    // Parse import data based on type
    if (importType === 'rebrickable') {
      const payload = JSON.parse(formData.get('payload') as string)
      const username = payload.username

      if (!username) {
        return NextResponse.json({ error: 'Rebrickable username is required' }, { status: 400 })
      }

      // Note: Rebrickable API integration would go here
      // For now, return error that it's not yet implemented
      return NextResponse.json(
        { error: 'Rebrickable import is not yet implemented. Please use CSV import for now.' },
        { status: 501 }
      )
    } else if (importType === 'lugnet') {
      const payload = JSON.parse(formData.get('payload') as string)
      const data = payload.data

      if (!data) {
        return NextResponse.json({ error: 'Lugnet data is required' }, { status: 400 })
      }

      // Parse Lugnet data (assuming simple format with set numbers)
      // This is a placeholder - actual parsing would depend on Lugnet's export format
      const lines = data.split('\n').filter((line: string) => line.trim())
      setsToImport = lines.map((line: string) => {
        const parts = line.trim().split(/\s+/)
        return {
          set_number: parts[0] || '',
          quantity: parts[1] ? parseInt(parts[1], 10) : 1,
        }
      }).filter((set: any) => set.set_number)

      if (setsToImport.length === 0) {
        return NextResponse.json({ error: 'No valid sets found in Lugnet data' }, { status: 400 })
      }
    } else if (importType === 'csv') {
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ error: 'CSV file is required' }, { status: 400 })
      }

      const text = await file.text()
      
      // Simple CSV parser that handles quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"'
              i++ // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        
        // Add last field
        result.push(current.trim())
        return result
      }

      const lines = text.split(/\r?\n/).filter((line) => line.trim())
      
      if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV file must have a header row and at least one data row' }, { status: 400 })
      }

      // Parse CSV header
      const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase())
      
      // More flexible column matching for various CSV formats
      const setNumberIndex = header.findIndex((h) => 
        h === 'set_number' || 
        h === 'setnumber' || 
        h === 'set' ||
        h === 'product_number' ||
        h === 'productnumber' ||
        h === 'product number' ||
        h === 'set_id' ||
        h === 'setid' ||
        h === 'id' ||
        h === 'set num' ||
        h === 'item number' ||
        h === 'item_number' ||
        h === 'code' ||
        h === 'sku' ||
        h === 'set #'
      )
      const quantityIndex = header.findIndex((h) => 
        h === 'quantity' || 
        h === 'qty' ||
        h === 'count' ||
        h === 'amount' ||
        h === 'owned' ||
        h === 'number owned'
      )
      const conditionIndex = header.findIndex((h) => 
        h === 'condition' || 
        h === 'state' ||
        h === 'status' ||
        h === 'set_condition'
      )

      if (setNumberIndex === -1) {
        return NextResponse.json(
          { 
            error: 'CSV file must have a set number column (tried: set_number, product_number, set_id, id, set, sku, code, etc.)',
            availableColumns: header
          },
          { status: 400 }
        )
      }

      // Parse CSV rows
      setsToImport = lines.slice(1).map((line) => {
        const values = parseCSVLine(line)
        const setNumber = (values[setNumberIndex] || '').trim()
        const quantity = quantityIndex >= 0 && values[quantityIndex] ? parseInt(values[quantityIndex], 10) : 1
        const condition: 'SEALED' | 'USED' = conditionIndex >= 0 && values[conditionIndex] 
          ? (values[conditionIndex].toUpperCase() === 'SEALED' ? 'SEALED' : 'USED')
          : 'SEALED'

        return {
          set_number: setNumber,
          quantity: isNaN(quantity) || quantity < 1 ? 1 : quantity,
          condition,
        }
      }).filter((set) => set.set_number && set.set_number.length > 0)

      if (setsToImport.length === 0) {
        return NextResponse.json({ error: 'No valid sets found in CSV file' }, { status: 400 })
      }
    }

    // Import sets
    const catalogProvider = getCatalogProvider()
    let importedCount = 0
    let errorCount = 0

    for (const setData of setsToImport) {
      try {
        // Search for the set to get its ID
        const searchResults = await catalogProvider.searchSets(setData.set_number, 1)
        const set = searchResults.find((s) => s.setNumber === setData.set_number)

        if (!set) {
          console.warn(`Set ${setData.set_number} not found`)
          errorCount++
          continue
        }

        // Get set ID from database
        const { data: dbSet } = await supabase
          .from('sets')
          .select('id')
          .eq('set_number', set.setNumber)
          .maybeSingle()

        if (!dbSet) {
          console.warn(`Set ${setData.set_number} not in database`)
          errorCount++
          continue
        }

        // Check if item already exists
        const { data: existing } = await supabase
          .from('user_collection_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('set_id', dbSet.id)
          .eq('collection_id', targetCollectionId)
          .maybeSingle()

        if (existing) {
          // Update quantity if it exists
          await supabase
            .from('user_collection_items')
            .update({
              quantity: setData.quantity || 1,
              condition: setData.condition || 'SEALED',
            })
            .eq('id', existing.id)
          importedCount++
        } else {
          // Create new collection item
          await supabase
            .from('user_collection_items')
            .insert({
              user_id: user.id,
              set_id: dbSet.id,
              collection_id: targetCollectionId,
              condition: setData.condition || 'SEALED',
              quantity: setData.quantity || 1,
            })
          importedCount++
        }
      } catch (error) {
        console.error(`Error importing set ${setData.set_number}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errorCount,
      total: setsToImport.length,
    })
  } catch (error) {
    console.error('Error importing collection:', error)
    return NextResponse.json(
      {
        error: 'Failed to import collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

