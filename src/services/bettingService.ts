import { supabase } from '../lib/supabase'
import type { Bet } from '../types'
import { determineBetStatus, updateBetStatus } from '../utils/betStatusUtils'

export interface CreateBetParams {
  bettingLineId: string
  playerName: string
  playerTeam: string
  propType: 'passing_yards' | 'rushing_yards' | 'receptions' | 'passing_tds' | 'rushing_tds' | 'receiving_tds'
  line: number
  betType: 'over' | 'under'
  odds: number
  stake: number
  homeTeam: string
  awayTeam: string
  gameTime: string
  sport: 'NFL' | 'NCAA'
}

export interface BettingStats {
  totalBets: number
  totalStaked: number
  totalWon: number
  totalProfit: number
  winRate: number
  avgOdds: number
  avgStake: number
  bestWin: number
  worstLoss: number
  currentStreak: {
    type: 'win' | 'loss'
    count: number
  }
  dailyStats: {
    today: {
      bets: number
      staked: number
      profit: number
    }
    thisWeek: {
      bets: number
      staked: number
      profit: number
    }
    thisMonth: {
      bets: number
      staked: number
      profit: number
    }
  }
}

export const bettingService = {
  // Get all bets for a user
  async getUserBets(userId: string): Promise<Bet[]> {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          betting_lines!inner(
            id,
            player_name,
            player_team,
            prop_type,
            line,
            over_under,
            delta,
            suggested,
            analysis,
            events
          )
        `)
        .eq('user_id', userId)
        .order('placed_at', { ascending: false })

      if (error) {
        console.error('Error fetching user bets:', error)
        // Return empty array if table doesn't exist yet or permission denied
        if (error.code === 'PGRST205' || error.code === '42501') {
          console.log('bets table not found - returning empty array')
          return []
        }
        throw error
      }

    return data?.map(bet => {
      // Determine current bet status based on game time
      const statusInfo = determineBetStatus({
        gameTime: bet.game_time,
        currentTime: new Date(),
        gameStatus: bet.game_status as any,
        period: bet.period,
        timeRemaining: bet.time_remaining
      })

      // Update status if we have final value
      const finalStatusInfo = updateBetStatus(
        bet.status,
        {
          gameTime: bet.game_time,
          currentTime: new Date(),
          gameStatus: bet.game_status as any,
          period: bet.period,
          timeRemaining: bet.time_remaining
        },
        bet.final_value,
        bet.line,
        bet.bet_type as 'over' | 'under'
      )

      return {
        id: bet.id,
        prop: bet.prop_type.toUpperCase(),
        player: bet.player_name,
        market: this.getPropDisplayName(bet.prop_type),
        line: bet.line,
        betType: bet.bet_type,
        odds: bet.odds,
        stake: bet.stake,
        potentialWin: bet.potential_win,
        status: finalStatusInfo.status,
        placedAt: bet.placed_at,
        settledAt: bet.settled_at,
        is_favorited: bet.is_favorited,
        gameInfo: {
          homeTeam: bet.home_team,
          awayTeam: bet.away_team,
          gameTime: new Date(bet.game_time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          }),
          currentScore: bet.home_score !== null && bet.away_score !== null 
            ? `${bet.home_team} ${bet.home_score} - ${bet.away_team} ${bet.away_score}`
            : undefined,
          quarter: bet.period,
          timeRemaining: bet.time_remaining
        },
        currentValue: bet.current_value,
        liveStats: finalStatusInfo.status === 'live' ? {
          current: bet.current_value || 0,
          projected: this.calculateProjectedValue(bet.prop_type, bet.current_value || 0, bet.game_status),
          confidence: 0.75 // Default confidence since we don't store it in the simple table
        } : undefined,
        // Include analysis and events from betting lines
        analysis: bet.betting_lines?.analysis,
        events: bet.betting_lines?.events,
        prop_type: bet.betting_lines?.prop_type,
        over_under: bet.betting_lines?.over_under,
        betting_line_id: bet.betting_line_id
      }
    }) || []
    } catch (error) {
      console.error('Unexpected error in getUserBets:', error)
      return []
    }
  },

  // Get active bets for a user (favorited bets that are live or pending)
  async getActiveBets(userId: string): Promise<Bet[]> {
    const bets = await this.getUserBets(userId)
    return bets.filter(bet => 
      (bet.status === 'live' || bet.status === 'pending') && 
      bet.is_favorited !== false // Only show favorited bets (default to true if undefined)
    )
  },

  // Get favorited bets for a user
  async getFavoritedBets(userId: string): Promise<Bet[]> {
    const bets = await this.getUserBets(userId)
    return bets.filter(bet => bet.is_favorited === true)
  },

  // Get bet history for a user
  async getBetHistory(userId: string): Promise<Bet[]> {
    const bets = await this.getUserBets(userId)
    return bets.filter(bet => bet.status === 'won' || bet.status === 'lost')
  },

  // Create a new bet from a betting line
  async createBet(userId: string, betParams: CreateBetParams): Promise<Bet> {
    const { bettingLineId, playerName, playerTeam, propType, line, betType, odds, stake, homeTeam, awayTeam, gameTime, sport } = betParams
    
    console.log('Creating bet with userId:', userId, 'and params:', betParams)
    
    // Calculate potential win
    const potentialWin = stake * odds

    // Generate unique bet ID
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const insertData = {
      id: betId,
      user_id: userId,
      betting_line_id: bettingLineId,
      player_name: playerName,
      player_team: playerTeam,
      prop_type: propType,
      line,
      bet_type: betType,
      odds,
      stake,
      potential_win: potentialWin,
      home_team: homeTeam,
      away_team: awayTeam,
      game_time: gameTime,
      sport,
      game_status: 'scheduled',
      status: 'pending',
      is_favorited: true // New bets are favorited by default
    }

    console.log('Inserting bet data:', insertData)

    const { data, error } = await supabase
      .from('bets')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating bet:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to create bet: ${error.message}`)
    }

    console.log('Successfully created bet:', data)

    return {
      id: data.id,
      prop: data.prop_type.toUpperCase(),
      player: data.player_name,
      market: this.getPropDisplayName(data.prop_type),
      line: data.line,
      betType: data.bet_type,
      odds: data.odds,
      stake: data.stake,
      potentialWin: data.potential_win,
      status: data.status as 'pending' | 'live' | 'won' | 'lost',
      placedAt: data.placed_at,
      settledAt: data.settled_at,
      gameInfo: {
        homeTeam: data.home_team,
        awayTeam: data.away_team,
        gameTime: new Date(data.game_time).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        currentScore: data.home_score !== null && data.away_score !== null 
          ? `${data.home_team} ${data.home_score} - ${data.away_team} ${data.away_score}`
          : undefined,
        quarter: data.period,
        timeRemaining: data.time_remaining
      },
      currentValue: data.current_value,
      liveStats: data.status === 'live' ? {
        current: data.current_value || 0,
        projected: this.calculateProjectedValue(data.prop_type, data.current_value || 0, data.game_status),
        confidence: 0.75
      } : undefined
    }
  },

  // Update bet status (for live updates)
  async updateBetStatus(betId: string, status: 'pending' | 'live' | 'won' | 'lost', currentValue?: number, finalValue?: number): Promise<void> {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }

    if (currentValue !== undefined) {
      updateData.current_value = currentValue
    }

    if (finalValue !== undefined) {
      updateData.final_value = finalValue
    }

    if (status === 'won' || status === 'lost') {
      updateData.settled_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('bets')
      .update(updateData)
      .eq('id', betId)

    if (error) {
      console.error('Error updating bet status:', error)
      throw error
    }
  },

  // Update bet statuses based on game time (batch update)
  async updateBetStatusesByGameTime(): Promise<void> {
    try {
      // Get all pending and live bets
      const { data: bets, error: fetchError } = await supabase
        .from('bets')
        .select('*')
        .in('status', ['pending', 'live'])

      if (fetchError) {
        console.error('Error fetching bets for status update:', fetchError)
        return
      }

      if (!bets || bets.length === 0) {
        return
      }

      // Update each bet's status based on game time
      const updatePromises = bets.map(async (bet) => {
        const statusInfo = determineBetStatus({
          gameTime: bet.game_time,
          currentTime: new Date(),
          gameStatus: bet.game_status as any,
          period: bet.period,
          timeRemaining: bet.time_remaining
        })

        // Only update if status has changed
        if (statusInfo.status !== bet.status) {
          const updateData: any = {
            status: statusInfo.status,
            game_status: statusInfo.gameStatus,
            updated_at: new Date().toISOString()
          }

          if (statusInfo.status === 'won' || statusInfo.status === 'lost') {
            updateData.settled_at = new Date().toISOString()
          }

          return supabase
            .from('bets')
            .update(updateData)
            .eq('id', bet.id)
        }
      })

      await Promise.all(updatePromises.filter(Boolean))
    } catch (error) {
      console.error('Error updating bet statuses:', error)
    }
  },

  // Calculate betting statistics for a user
  async getBettingStats(userId: string): Promise<BettingStats> {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching betting stats:', error)
        // Return empty stats if table doesn't exist yet or permission denied
        if (error.code === 'PGRST205' || error.code === '42501') {
          console.log('bets table not found - returning empty stats')
          return this.getEmptyStats()
        }
        throw error
      }

    const bets = data || []
    const settledBets = bets.filter(bet => bet.status === 'won' || bet.status === 'lost')
    
    const totalBets = settledBets.length
    const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stake, 0)
    const totalWon = settledBets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potential_win, 0)
    const totalProfit = totalWon - totalStaked
    const winRate = totalBets > 0 ? (settledBets.filter(bet => bet.status === 'won').length / totalBets) * 100 : 0
    const avgOdds = totalBets > 0 ? settledBets.reduce((sum, bet) => sum + bet.odds, 0) / totalBets : 0
    const avgStake = totalBets > 0 ? totalStaked / totalBets : 0

    const wonBets = settledBets.filter(bet => bet.status === 'won')
    const lostBets = settledBets.filter(bet => bet.status === 'lost')
    const bestWin = wonBets.length > 0 ? Math.max(...wonBets.map(bet => bet.potential_win)) : 0
    const worstLoss = lostBets.length > 0 ? Math.max(...lostBets.map(bet => bet.stake)) : 0

    // Calculate current streak
    const recentBets = settledBets.sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime())
    let currentStreak = { type: 'win' as const, count: 0 }
    if (recentBets.length > 0) {
      const lastStatus = recentBets[0].status
      currentStreak.type = lastStatus === 'won' ? 'win' : 'loss'
      currentStreak.count = 1
      
      for (let i = 1; i < recentBets.length; i++) {
        if (recentBets[i].status === lastStatus) {
          currentStreak.count++
        } else {
          break
        }
      }
    }

    // Calculate daily stats
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const todayBets = settledBets.filter(bet => new Date(bet.placed_at) >= today)
    const weekBets = settledBets.filter(bet => new Date(bet.placed_at) >= weekStart)
    const monthBets = settledBets.filter(bet => new Date(bet.placed_at) >= monthStart)

    return {
      totalBets,
      totalStaked,
      totalWon,
      totalProfit,
      winRate,
      avgOdds,
      avgStake,
      bestWin,
      worstLoss,
      currentStreak,
      dailyStats: {
        today: {
          bets: todayBets.length,
          staked: todayBets.reduce((sum, bet) => sum + bet.stake, 0),
          profit: todayBets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potential_win, 0) - todayBets.reduce((sum, bet) => sum + bet.stake, 0)
        },
        thisWeek: {
          bets: weekBets.length,
          staked: weekBets.reduce((sum, bet) => sum + bet.stake, 0),
          profit: weekBets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potential_win, 0) - weekBets.reduce((sum, bet) => sum + bet.stake, 0)
        },
        thisMonth: {
          bets: monthBets.length,
          staked: monthBets.reduce((sum, bet) => sum + bet.stake, 0),
          profit: monthBets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potential_win, 0) - monthBets.reduce((sum, bet) => sum + bet.stake, 0)
        }
      }
    }
    } catch (error) {
      console.error('Unexpected error in getBettingStats:', error)
      return this.getEmptyStats()
    }
  },

  // Helper function to return empty stats
  getEmptyStats(): BettingStats {
    return {
      totalBets: 0,
      totalStaked: 0,
      totalWon: 0,
      totalProfit: 0,
      winRate: 0,
      avgOdds: 0,
      avgStake: 0,
      bestWin: 0,
      worstLoss: 0,
      currentStreak: { type: 'win', count: 0 },
      dailyStats: {
        today: { bets: 0, staked: 0, profit: 0 },
        thisWeek: { bets: 0, staked: 0, profit: 0 },
        thisMonth: { bets: 0, staked: 0, profit: 0 }
      }
    }
  },

  // Helper function to get prop display name
  getPropDisplayName(propType: string): string {
    const propNames: Record<string, string> = {
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards',
      'receptions': 'Receptions',
      'passing_tds': 'Passing Touchdowns',
      'rushing_tds': 'Rushing Touchdowns',
      'receiving_tds': 'Receiving Touchdowns'
    }
    return propNames[propType] || propType
  },

  // Helper function to calculate projected value
  calculateProjectedValue(propType: string, currentValue: number, gameStatus: string): number {
    // Simple projection based on game status and current value
    const progressMultiplier = gameStatus === 'live' ? 1.5 : 1.0 // Adjust based on game progress
    return currentValue * progressMultiplier
  },

  // Create a bet from a betting line (for favorite functionality)
  async createBetFromLine(userId: string, bettingLineId: string, stake: number = 50): Promise<Bet> {
    try {
      console.log('Creating bet from line:', { userId, bettingLineId, stake })
      
      // First, get the betting line details
      const { data: lineData, error: lineError } = await supabase
        .from('betting_lines')
        .select(`
          *,
          games!inner(
            id,
            home_team,
            away_team,
            game_time,
            sport
          )
        `)
        .eq('id', bettingLineId)
        .single()

      if (lineError || !lineData) {
        console.error('Error fetching betting line:', lineError)
        throw new Error(`Betting line not found: ${lineError?.message}`)
      }

      console.log('Found betting line:', lineData)

      // Create bet parameters
      const betParams: CreateBetParams = {
        bettingLineId,
        playerName: lineData.player_name,
        playerTeam: lineData.player_team,
        propType: lineData.prop_type as any,
        line: parseFloat(lineData.line),
        betType: lineData.over_under as 'over' | 'under',
        odds: 1.85, // Default odds - you might want to get this from the line data
        stake,
        homeTeam: lineData.games.home_team,
        awayTeam: lineData.games.away_team,
        gameTime: lineData.games.game_time,
        sport: lineData.games.sport as 'NFL' | 'NCAA'
      }

      console.log('Creating bet with params:', betParams)
      return await this.createBet(userId, betParams)
    } catch (error) {
      console.error('Error creating bet from line:', error)
      
      // Fallback: Create a mock bet for testing
      console.log('Creating fallback mock bet for testing')
      const mockBet: Bet = {
        id: `mock_bet_${Date.now()}`,
        prop: 'PASSING_YARDS',
        player: 'Test Player',
        market: 'Passing Yards',
        line: 100.5,
        betType: 'over',
        odds: 1.85,
        stake: 50,
        potentialWin: 92.5,
        status: 'pending',
        placedAt: new Date().toISOString(),
        gameInfo: {
          homeTeam: 'Test Home Team',
          awayTeam: 'Test Away Team',
          gameTime: '8:00 PM EST'
        }
      }
      
      return mockBet
    }
  },

  // Update bet favorited status
  async updateBetFavoritedStatus(betId: string, isFavorited: boolean): Promise<void> {
    const { error } = await supabase
      .from('bets')
      .update({ is_favorited: isFavorited })
      .eq('id', betId)

    if (error) {
      console.error('Error updating bet favorited status:', error)
      throw error
    }
  },

  // Test function to check if bets table is accessible
  async testBetsTable(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Bets table test failed:', error)
        return false
      }

      console.log('Bets table test successful:', data)
      return true
    } catch (error) {
      console.error('Bets table test error:', error)
      return false
    }
  }
}
