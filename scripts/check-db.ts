
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkCollections() {
  console.log('Checking for collections table...')
  try {
    const { data, error } = await supabase.from('collections').select('count').limit(1)
    if (error) {
      console.error('Error querying collections:', error)
    } else {
      console.log('Collections table exists!')
    }
  } catch (e) {
    console.error('Exception:', e)
  }
}

checkCollections()






