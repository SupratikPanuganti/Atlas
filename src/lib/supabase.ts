import { createClient } from '@supabase/supabase-js'
import { config } from '../config'
import { logger } from '../utils'

// Supabase configuration from centralized config
const supabaseUrl = config.supabase.url
const supabaseKey = config.supabase.anonKey

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  const error = new Error('Supabase configuration is missing')
  logger.error('Supabase configuration error:', error)
  throw error
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Debug logging
console.log('Supabase client initialized with:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  keyLength: supabaseKey?.length,
  role: supabaseKey?.includes('service_role') ? 'service_role' : 'anon',
  keyStart: supabaseKey?.substring(0, 20) + '...'
})

// Test connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('betting_lines').select('count').limit(1)
    if (error) {
      logger.error('Supabase connection test failed:', error)
      return false
    }
    logger.info('Supabase connection successful')
    return true
  } catch (error) {
    logger.error('Supabase connection test error:', error)
    return false
  }
}

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          sport: string
          home_team: string
          away_team: string
          game_time: string
          status: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed'
          period: string | null
          time_remaining: string | null
          home_score: number
          away_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sport: string
          home_team: string
          away_team: string
          game_time: string
          status?: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed'
          period?: string | null
          time_remaining?: string | null
          home_score?: number
          away_score?: number
        }
        Update: {
          status?: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed'
          period?: string | null
          time_remaining?: string | null
          home_score?: number
          away_score?: number
        }
      }
      players: {
        Row: {
          id: string
          name: string
          team: string
          sport: string
          position: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          team: string
          sport: string
          position?: string | null
        }
        Update: {
          name?: string
          team?: string
          position?: string | null
        }
      }
      player_stats: {
        Row: {
          id: string
          game_id: string
          player_id: string
          passing_yards: number
          rushing_yards: number
          receptions: number
          passing_tds: number
          rushing_tds: number
          receiving_tds: number
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          passing_yards?: number
          rushing_yards?: number
          receptions?: number
          passing_tds?: number
          rushing_tds?: number
          receiving_tds?: number
        }
        Update: {
          passing_yards?: number
          rushing_yards?: number
          receptions?: number
          passing_tds?: number
          rushing_tds?: number
          receiving_tds?: number
        }
      }
      h2h_lines: {
        Row: {
          id: string
          creator_id: string
          sport: string
          game_id: string
          player_id: string
          prop_type: 'passing_yards' | 'rushing_yards' | 'receptions' | 'passing_tds' | 'rushing_tds' | 'receiving_tds'
          custom_line: number
          side: 'over' | 'under'
          stake_credits: number
          payout_multiplier: number
          market_line: number | null
          fair_value: number | null
          status: 'open' | 'matched' | 'live' | 'settled' | 'cancelled'
          matched_with: string | null
          matched_at: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          sport: string
          game_id: string
          player_id: string
          prop_type: 'passing_yards' | 'rushing_yards' | 'receptions' | 'passing_tds' | 'rushing_tds' | 'receiving_tds'
          custom_line: number
          side: 'over' | 'under'
          stake_credits?: number
          payout_multiplier?: number
          market_line?: number | null
          fair_value?: number | null
          status?: 'open' | 'matched' | 'live' | 'settled' | 'cancelled'
          matched_with?: string | null
          matched_at?: string | null
          expires_at: string
        }
        Update: {
          status?: 'open' | 'matched' | 'live' | 'settled' | 'cancelled'
          matched_with?: string | null
          matched_at?: string | null
        }
      }
      h2h_matches: {
        Row: {
          id: string
          line_id: string
          creator_id: string
          opponent_id: string
          creator_side: 'over' | 'under'
          opponent_side: 'over' | 'under'
          stake_credits: number
          status: 'matched' | 'live' | 'settled'
          winner: 'creator' | 'opponent' | null
          settled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          line_id: string
          creator_id: string
          opponent_id: string
          creator_side: 'over' | 'under'
          opponent_side: 'over' | 'under'
          stake_credits: number
          status?: 'matched' | 'live' | 'settled'
          winner?: 'creator' | 'opponent' | null
          settled_at?: string | null
        }
        Update: {
          status?: 'matched' | 'live' | 'settled'
          winner?: 'creator' | 'opponent' | null
          settled_at?: string | null
        }
      }
      live_pricing: {
        Row: {
          id: string
          game_id: string
          player_id: string
          prop_type: string
          line: number
          odds: number
          median_line: number | null
          fair_value: number | null
          mispricing: number | null
          ev_per_1: number | null
          confidence: number | null
          last_change_ts: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          prop_type: string
          line: number
          odds: number
          median_line?: number | null
          fair_value?: number | null
          mispricing?: number | null
          ev_per_1?: number | null
          confidence?: number | null
        }
        Update: {
          odds?: number
          fair_value?: number | null
          mispricing?: number | null
          ev_per_1?: number | null
          confidence?: number | null
          last_change_ts?: string
        }
      }
    }
  }
}
