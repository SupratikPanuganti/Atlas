import { supabase } from '../lib/supabase'
import type { H2HLine, Bet, BettingStats, PricingData, LiveStreamData, RadarItem } from '../types'

// Database service to replace mock data with real database calls
export const databaseService = {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('databaseService: Testing connection with service role...')
      const { data, error } = await supabase.from('betting_lines').select('count').limit(1)
      if (error) {
        console.error('databaseService: Connection test failed:', error)
        return false
      }
      console.log('databaseService: Connection test successful - service role working!')
      return true
    } catch (error) {
      console.error('databaseService: Connection test error:', error)
      return false
    }
  },

  // Get betting lines from the minimal database schema
  async getBettingLines(): Promise<any[]> {
    try {
      console.log('databaseService: Attempting to fetch betting lines...')
      
      const { data, error } = await supabase
        .from('betting_lines')
        .select('*')
        .order('last_updated', { ascending: false })
      
      if (error) {
        console.error('databaseService: Error fetching betting lines:', error)
        return []
      }
      
      console.log('databaseService: Successfully fetched', data?.length || 0, 'betting lines')
      console.log('databaseService: Sample betting line:', data?.[0])
      return data || []
    } catch (error) {
      console.error('databaseService: Failed to get betting lines:', error)
      return []
    }
  },
  
  // ===== GAMES =====
  async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('game_time', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getLiveGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .in('status', ['live', 'halftime'])
      .order('game_time', { ascending: true })
    
    if (error) throw error
    return data
  },

  // ===== PLAYERS =====
  async getPlayers() {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async getPlayersByTeam(team: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team', team)
      .order('position', { ascending: true })
    
    if (error) throw error
    return data
  },

  // ===== PLAYER STATS =====
  async getPlayerStats(gameId: string) {
    const { data, error } = await supabase
      .from('player_stats')
      .select(`
        *,
        players(*)
      `)
      .eq('game_id', gameId)
    
    if (error) throw error
    return data
  },

  async getPlayerStatsForPlayer(playerId: string, gameId: string) {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId)
      .eq('game_id', gameId)
      .single()
    
    if (error) throw error
    return data
  },

  // ===== H2H LINES =====
  async getH2HLines(status?: string) {
    let query = supabase
      .from('h2h_lines')
      .select(`
        *,
        games(*),
        players(*)
      `)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async getOpenH2HLines() {
    return this.getH2HLines('open')
  },

  async getLiveH2HLines() {
    return this.getH2HLines('live')
  },

  async createH2HLine(lineData: {
    creator_id: string
    sport: string
    game_id: string
    player_id: string
    prop_type: 'passing_yards' | 'rushing_yards' | 'receptions' | 'passing_tds' | 'rushing_tds' | 'receiving_tds'
    custom_line: number
    side: 'over' | 'under'
    stake_credits: number
    expires_at: string
    market_line?: number
    fair_value?: number
  }) {
    const { data, error } = await supabase
      .from('h2h_lines')
      .insert(lineData)
      .select(`
        *,
        games(*),
        players(*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async updateH2HLineStatus(lineId: string, status: 'open' | 'matched' | 'live' | 'settled' | 'cancelled', matchedWith?: string) {
    const updateData: any = { status }
    if (matchedWith) {
      updateData.matched_with = matchedWith
      updateData.matched_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('h2h_lines')
      .update(updateData)
      .eq('id', lineId)
      .select(`
        *,
        games(*),
        players(*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // ===== H2H MATCHES =====
  async createH2HMatch(matchData: {
    line_id: string
    creator_id: string
    opponent_id: string
    creator_side: 'over' | 'under'
    opponent_side: 'over' | 'under'
    stake_credits: number
  }) {
    const { data, error } = await supabase
      .from('h2h_matches')
      .insert(matchData)
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async getH2HMatches(userId?: string) {
    let query = supabase
      .from('h2h_matches')
      .select(`
        *,
        h2h_lines(
          *,
          games(*),
          players(*)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // ===== LIVE PRICING =====
  async getLivePricing(gameId?: string) {
    let query = supabase
      .from('live_pricing')
      .select(`
        *,
        games(*),
        players(*)
      `)
      .order('last_change_ts', { ascending: false })
    
    if (gameId) {
      query = query.eq('game_id', gameId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // ===== CONVERSION FUNCTIONS =====
  // Convert database H2H line to frontend H2HLine type
  convertDbH2HLineToFrontend(dbLine: any): H2HLine {
    return {
      id: dbLine.id,
      creatorId: dbLine.creator_id,
      sport: dbLine.sport as 'basketball' | 'football' | 'baseball' | 'soccer',
      game: {
        homeTeam: dbLine.games.home_team,
        awayTeam: dbLine.games.away_team,
        gameTime: dbLine.games.game_time,
        gameId: dbLine.games.id
      },
      player: dbLine.players.name,
      propType: dbLine.prop_type as 'points' | 'assists' | 'rebounds' | 'passing_yards' | 'rushing_yards' | 'receptions' | 'goals' | 'saves',
      customLine: parseFloat(dbLine.custom_line),
      side: dbLine.side as 'over' | 'under',
      stakeCredits: dbLine.stake_credits,
      payoutMultiplier: parseFloat(dbLine.payout_multiplier || '1.0'),
      marketLine: dbLine.market_line ? parseFloat(dbLine.market_line) : undefined,
      fairValue: dbLine.fair_value ? parseFloat(dbLine.fair_value) : undefined,
      status: dbLine.status as 'open' | 'matched' | 'live' | 'settled' | 'cancelled',
      createdAt: dbLine.created_at,
      expiresAt: dbLine.expires_at,
      matchedWith: dbLine.matched_with,
      matchedAt: dbLine.matched_at,
      gameStarted: dbLine.games.status === 'live' || dbLine.games.status === 'finished'
    }
  },

  // Convert database data to frontend Bet type
  convertDbToBet(dbMatch: any, dbLine: any): Bet {
    const game = dbLine.games
    const player = dbLine.players
    
    return {
      id: dbMatch.id,
      prop: dbLine.prop_type.toUpperCase(),
      player: player.name,
      market: this.formatMarketName(dbLine.prop_type),
      line: parseFloat(dbLine.custom_line),
      betType: dbMatch.creator_side as 'over' | 'under',
      odds: 1.9, // Default odds for H2H
      stake: dbMatch.stake_credits,
      potentialWin: dbMatch.stake_credits * 0.9, // 90% payout
      status: this.mapMatchStatusToBetStatus(dbMatch.status),
      placedAt: dbMatch.created_at,
      settledAt: dbMatch.settled_at,
      gameInfo: {
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        gameTime: game.game_time,
        currentScore: game.status === 'live' || game.status === 'finished' 
          ? `${game.home_team} ${game.home_score} - ${game.away_team} ${game.away_score}`
          : undefined,
        quarter: game.period,
        timeRemaining: game.time_remaining
      }
    }
  },

  // Convert database pricing to frontend PricingData
  convertDbToPricingData(dbPricing: any): PricingData {
    return {
      prop: `${dbPricing.prop_type}_${dbPricing.line}`,
      p_fair: dbPricing.fair_value ? parseFloat(dbPricing.fair_value) / 100 : 0.5,
      fair_price: dbPricing.fair_value ? parseFloat(dbPricing.fair_value) / 100 : 0.5,
      market_price: parseFloat(dbPricing.odds) / (parseFloat(dbPricing.odds) + 1),
      mispricing: dbPricing.mispricing ? parseFloat(dbPricing.mispricing) : 0,
      ev_per_1: dbPricing.ev_per_1 ? parseFloat(dbPricing.ev_per_1) : 0,
      fair_odds: dbPricing.fair_value ? parseFloat(dbPricing.fair_value) : 1.5,
      band: {
        lo: dbPricing.fair_value ? parseFloat(dbPricing.fair_value) * 0.95 : 0.45,
        hi: dbPricing.fair_value ? parseFloat(dbPricing.fair_value) * 1.05 : 0.55
      },
      theta_per_30s: -0.01, // Default decay
      drivers: [] // Will be populated by AI analysis
    }
  },

  // Helper functions
  formatMarketName(propType: string): string {
    const marketMap: { [key: string]: string } = {
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards',
      'receptions': 'Receptions',
      'passing_tds': 'Passing TDs',
      'rushing_tds': 'Rushing TDs',
      'receiving_tds': 'Receiving TDs'
    }
    return marketMap[propType] || propType
  },

  mapMatchStatusToBetStatus(matchStatus: string): 'pending' | 'live' | 'won' | 'lost' {
    switch (matchStatus) {
      case 'matched': return 'pending'
      case 'live': return 'live'
      case 'settled': return 'won' // This would need winner logic
      default: return 'pending'
    }
  },

  // ===== REAL-TIME SUBSCRIPTIONS =====
  subscribeToH2HLines(callback: (payload: any) => void) {
    return supabase
      .channel('h2h-lines')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'h2h_lines' }, 
        callback
      )
      .subscribe()
  },

  subscribeToGames(callback: (payload: any) => void) {
    return supabase
      .channel('games')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' }, 
        callback
      )
      .subscribe()
  },

  subscribeToPlayerStats(callback: (payload: any) => void) {
    return supabase
      .channel('player-stats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'player_stats' }, 
        callback
      )
      .subscribe()
  },

  // ===== USER-SPECIFIC FUNCTIONS =====
  async getUserBets(userId: string) {
    const { data, error } = await supabase
      .from('h2h_matches')
      .select(`
        *,
        h2h_lines (
          *,
          games (home_team, away_team, game_time, status),
          players (name, team, position)
        )
      `)
      .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        h2h_lines (
          *,
          games (home_team, away_team, game_time, status),
          players (name, team, position)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async addToFavorites(userId: string, lineId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({ user_id: userId, line_id: lineId })
      .select()
    
    if (error) throw error
    return data
  },

  async removeFromFavorites(userId: string, lineId: string) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('line_id', lineId)
    
    if (error) throw error
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserCredits(userId: string, credits: number) {
    const { data, error } = await supabase
      .from('users')
      .update({ credits, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data
  }
}
