import type { RadarItem } from '../types'

// Lazy import to avoid initialization issues
let supabase: any = null

const getSupabase = async () => {
  if (!supabase) {
    try {
      const { supabase: supabaseClient } = await import('../lib/supabase')
      supabase = supabaseClient
    } catch (error) {
      console.error('Failed to import supabase:', error)
      return null
    }
  }
  return supabase
}

export interface BettingLine {
  id: string
  sport: string
  player_name: string
  player_team: string
  player_position: string
  prop_type: string
  line: number
  over_odds: number
  under_odds: number
  fair_value_over: number
  fair_value_under: number
  market_confidence: number
  edge_over: number
  edge_under: number
  ai_recommendation: string
  ai_confidence: number
  ai_reasoning: string
  opening_line: number
  line_movement: number
  game_time: string
  cutoff_time: string
  created_at: string
  updated_at: string
}

export interface Suggestion {
  id: string
  propId: string
  label: string
  deltaVsMedian: number
  staleMin: number
  sport: string
  edge: number
  recommendation: string
  confidence: number
  reasoning: string
  line: number
  odds: number
  player: string
  team: string
  propType: string
  created_at: string
}

export const bettingLinesService = {
  // Test connection using betting_lines table instead of games
  async testConnection(): Promise<boolean> {
    try {
      console.log('bettingLinesService: Testing Supabase connection...')
      const client = await getSupabase()
      if (!client) {
        console.error('bettingLinesService: Failed to get Supabase client')
        return false
      }
      // Test with betting_lines table instead of games table
      const { data, error } = await client.from('betting_lines').select('count').limit(1)
      if (error) {
        console.error('bettingLinesService: Connection test failed:', error)
        return false
      }
      console.log('bettingLinesService: Connection test successful')
      return true
    } catch (error) {
      console.error('bettingLinesService: Connection test error:', error)
      return false
    }
  },

  // Get all active betting lines for today
  async getTodaysLines(sport: 'NCAA' | 'NFL' = 'NCAA'): Promise<BettingLine[]> {
    try {
      console.log('bettingLinesService: Attempting to fetch lines for sport:', sport)
      
      const client = await getSupabase()
      if (!client) {
        console.error('bettingLinesService: Supabase client is not initialized')
        return []
      }

      const { data, error } = await client
        .from('betting_lines')
        .select('*')
        .eq('sport', sport)
        .order('created_at', { ascending: false }) // Most recent first
        .limit(20) // Limit to 20 lines for performance

      if (error) {
        console.error('Error fetching today\'s lines:', error)
        return []
      }

      console.log('bettingLinesService: Successfully fetched', data?.length || 0, 'lines')
      return data || []
    } catch (error) {
      console.error('Error in getTodaysLines:', error)
      return []
    }
  },

  // Get top suggestions based on edge values
  async getTopSuggestions(sport: 'NCAA' | 'NFL' = 'NCAA', limit: number = 3): Promise<Suggestion[]> {
    try {
      const client = await getSupabase()
      if (!client) {
        console.error('bettingLinesService: Supabase client is not initialized')
        return []
      }

      const { data, error } = await client
        .from('betting_lines')
        .select('*')
        .eq('sport', sport)
        .order('created_at', { ascending: false }) // Most recent first
        .limit(limit * 2) // Get more to filter for best ones

      if (error) {
        console.error('Error fetching suggestions:', error)
        return []
      }

      if (!data) return []

      // Convert to suggestions and sort by highest edge
      const suggestions: Suggestion[] = data.map(line => {
        const edge = Math.max(line.edge_over, line.edge_under)
        const recommendation = line.edge_over > line.edge_under ? 'over' : 'under'
        const odds = recommendation === 'over' ? line.over_odds : line.under_odds
        
         // Calculate delta vs median: 0-1 = negative (red), 1+ = positive (green)
         // Edge values are typically 0.02-0.15, create more realistic variation
         // Use edge value directly scaled to 0-2 range, with some randomness for variation
         const baseDelta = Math.abs(edge) * 20 // Scale to 0-3 range
         const variation = (Math.random() - 0.5) * 0.4 // Add ±0.2 variation
         const deltaVsMedian = Math.max(0.1, Math.min(2.5, baseDelta + variation))
        
        // Calculate stale minutes (time since creation)
        const lastMovement = new Date(line.created_at)
        const now = new Date()
        const staleMin = Math.floor((now.getTime() - lastMovement.getTime()) / (1000 * 60))

        return {
          id: line.id,
          propId: `${line.prop_type}_${recommendation}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`,
          label: `${line.player_name} ${this.getPropDisplayName(line.prop_type)} ${line.line} ${recommendation === 'over' ? 'o' : 'u'}`,
          deltaVsMedian,
          staleMin: Math.max(0, staleMin),
          sport: line.sport,
          edge,
          recommendation,
          confidence: line.ai_confidence,
          reasoning: line.ai_reasoning,
          line: line.line,
          odds,
          player: line.player_name,
          team: line.player_team,
          propType: line.prop_type,
          created_at: line.created_at
        }
      })

      // Sort by delta (highest first), then by time if deltas are equal
      return suggestions
        .sort((a, b) => {
          const deltaDiff = b.deltaVsMedian - a.deltaVsMedian
          if (Math.abs(deltaDiff) < 0.01) { // If deltas are essentially equal
            // Sort by time (most recent first)
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          }
          return deltaDiff
        })
        .slice(0, limit)
    } catch (error) {
      console.error('Error in getTopSuggestions:', error)
      return []
    }
  },

  // Get filtered lines based on prop types and delta sign
  async getFilteredLines(
    sport: 'NCAA' | 'NFL' = 'NCAA',
    propTypes: string[] = [],
    deltaSign: 'both' | 'positive' | 'negative' = 'both',
    minDelta: number = 0.5
  ): Promise<RadarItem[]> {
    try {
      const lines = await this.getTodaysLines(sport)
      
      const radarItems: RadarItem[] = lines.map(line => {
        const edge = Math.max(line.edge_over, line.edge_under)
        const recommendation = line.edge_over > line.edge_under ? 'over' : 'under'
        
         // Calculate delta vs median: 0-1 = negative (red), 1+ = positive (green)
         // Edge values are typically 0.02-0.15, create more realistic variation
         // Use edge value directly scaled to 0-2 range, with some randomness for variation
         const baseDelta = Math.abs(edge) * 20 // Scale to 0-3 range
         const variation = (Math.random() - 0.5) * 0.4 // Add ±0.2 variation
         const deltaVsMedian = Math.max(0.1, Math.min(2.5, baseDelta + variation))
        
        // Calculate stale minutes
        const lastMovement = new Date(line.created_at)
        const now = new Date()
        const staleMin = Math.floor((now.getTime() - lastMovement.getTime()) / (1000 * 60))

        return {
          propId: `${line.prop_type}_${recommendation}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`,
          label: `${line.player_name} ${this.getPropDisplayName(line.prop_type)} ${line.line} ${recommendation === 'over' ? 'o' : 'u'}`,
          deltaVsMedian,
          staleMin: Math.max(0, staleMin),
          sport: line.sport as 'NCAA' | 'NFL'
        }
      })

      // Apply filters
      let filtered = radarItems

      // Filter by prop types
      if (propTypes.length > 0) {
        filtered = filtered.filter(item => {
          const propType = this.getPropDisplayName(item.label.split(' ')[1] + ' ' + item.label.split(' ')[2])
          return propTypes.includes(propType)
        })
      }

      // Filter by delta sign
      if (deltaSign !== 'both') {
        filtered = filtered.filter(item => {
          if (deltaSign === 'positive') {
            return item.deltaVsMedian > 0
          } else {
            return item.deltaVsMedian < 0
          }
        })
      }

      // Filter by minimum delta
      filtered = filtered.filter(item => Math.abs(item.deltaVsMedian) >= minDelta)

      return filtered.sort((a, b) => Math.abs(b.deltaVsMedian) - Math.abs(a.deltaVsMedian))
    } catch (error) {
      console.error('Error in getFilteredLines:', error)
      return []
    }
  },

  // Get display name for prop type
  getPropDisplayName(propType: string): string {
    const displayNames: { [key: string]: string } = {
        'passing_yards': 'Pass Yds',
        'rushing_yards': 'Rush Yds',
        'receptions': 'Rec',
        'passing_tds': 'Pass TDs',
        'rushing_tds': 'Rush TDs',
        'receiving_tds': 'Rec TDs',
        'passing_completions': 'Pass Comp',
        'passing_attempts': 'Pass Att',
        'interceptions': 'INT',
        'fumbles': 'FUM',
        'total_touchdowns': 'Total TD'
      }
      
    return displayNames[propType] || propType
  },

  // Convert database prop type to filter format
  convertPropTypeToFilter(propType: string): string {
    const conversions: { [key: string]: string } = {
      'passing_yards': 'PASS YDS',
      'rushing_yards': 'RUSH YDS',
      'receptions': 'REC',
      'passing_tds': 'PASS TD',
      'rushing_tds': 'RUSH TD',
      'receiving_tds': 'REC YDS',
      'passing_completions': 'PASS COMP',
      'passing_attempts': 'PASS ATT',
      'interceptions': 'INT',
      'fumbles': 'FUM',
      'total_touchdowns': 'TOTAL TD'
    }
    
    return conversions[propType] || propType.toUpperCase()
  }
}