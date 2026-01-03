// Database types (will be generated from Supabase later)
export type Database = {
  public: {
    Tables: {
      sets: {
        Row: {
          id: string
          set_number: string
          name: string
          theme: string | null
          year: number | null
          piece_count: number | null
          msrp_cents: number | null
          image_url: string | null
          retired: boolean
          brickset_id: string | null
          bricklink_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['sets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['sets']['Insert']>
      }
      set_identifiers: {
        Row: {
          id: string
          set_id: string
          identifier_type: string
          identifier_value: string
          source: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['set_identifiers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['set_identifiers']['Insert']>
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['collections']['Insert']>
      }
      user_collection_items: {
        Row: {
          id: string
          user_id: string
          collection_id: string | null
          set_id: string
          condition: 'SEALED' | 'USED'
          condition_grade: string | null
          quantity: number
          acquisition_cost_cents: number | null
          acquisition_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_collection_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_collection_items']['Insert']>
      }
      price_snapshots: {
        Row: {
          id: string
          set_id: string
          condition: 'SEALED' | 'USED'
          source: string
          price_cents: number
          currency: string
          timestamp: string
          sample_size: number | null
          variance: number | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['price_snapshots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['price_snapshots']['Insert']>
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          set_id: string | null
          alert_type: 'THRESHOLD' | 'PERCENT_CHANGE'
          condition: 'SEALED' | 'USED' | null
          threshold_cents: number | null
          percent_change: number | null
          window_days: number
          direction: 'ABOVE' | 'BELOW' | 'EITHER'
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }
      alert_events: {
        Row: {
          id: string
          alert_id: string
          set_id: string
          triggered_at: string
          price_cents: number
          previous_price_cents: number | null
          percent_change: number | null
          notification_sent: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alert_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alert_events']['Insert']>
      }
    }
  }
}

// Application types
export type Set = Database['public']['Tables']['sets']['Row']
export type SetIdentifier = Database['public']['Tables']['set_identifiers']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']
export type CollectionItem = Database['public']['Tables']['user_collection_items']['Row']
export type CollectionItemWithSet = CollectionItem & { sets: Set | null }
export type PriceSnapshot = Database['public']['Tables']['price_snapshots']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type AlertEvent = Database['public']['Tables']['alert_events']['Row']

export type Condition = 'SEALED' | 'USED'
export type AlertType = 'THRESHOLD' | 'PERCENT_CHANGE'
export type AlertDirection = 'ABOVE' | 'BELOW' | 'EITHER'
