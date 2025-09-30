import { supabase } from '../lib/supabase'
import { logger } from '../utils'

export class RealTimeService {
  private subscriptions: any[] = []
  private isConnected = false
  private store: any = null

  // Initialize with store reference
  initialize(store: any) {
    this.store = store
  }

  // Start real-time subscriptions
  startSubscriptions() {
    if (this.isConnected) return

    console.log('🔄 Starting real-time subscriptions')
    this.isConnected = true

    // Subscribe to H2H lines changes
    const h2hSubscription = supabase
      .channel('h2h-lines-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'h2h_lines' }, 
        (payload) => {
          console.log('H2H line changed:', payload)
          this.handleH2HLineChange(payload)
        }
      )
      .subscribe()

    // Subscribe to games changes
    const gamesSubscription = supabase
      .channel('games-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' }, 
        (payload) => {
          console.log('Game changed:', payload)
          this.handleGameChange(payload)
        }
      )
      .subscribe()

    // Subscribe to player stats changes
    const statsSubscription = supabase
      .channel('player-stats-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'player_stats' }, 
        (payload) => {
          console.log('Player stats changed:', payload)
          this.handlePlayerStatsChange(payload)
        }
      )
      .subscribe()

    // Subscribe to H2H matches changes
    const matchesSubscription = supabase
      .channel('h2h-matches-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'h2h_matches' }, 
        (payload) => {
          console.log('H2H match changed:', payload)
          this.handleH2HMatchChange(payload)
        }
      )
      .subscribe()

    this.subscriptions = [h2hSubscription, gamesSubscription, statsSubscription, matchesSubscription]
  }

  // Stop real-time subscriptions
  stopSubscriptions() {
    if (!this.isConnected) return

    console.log('🔄 Stopping real-time subscriptions')
    this.isConnected = false

    this.subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription)
    })
    this.subscriptions = []
  }

  // Handle H2H line changes
  private handleH2HLineChange(payload: any) {
    if (!this.store) return
    const store = this.store
    
    if (payload.eventType === 'INSERT') {
      // New line created - reload H2H lines
      store.loadH2HLines()
    } else if (payload.eventType === 'UPDATE') {
      // Line updated - update specific line
      const updatedLine = payload.new
      store.updateH2hLine(updatedLine.id, {
        status: updatedLine.status,
        matchedWith: updatedLine.matched_with,
        matchedAt: updatedLine.matched_at
      })
    } else if (payload.eventType === 'DELETE') {
      // Line deleted - remove from state
      const deletedLine = payload.old
      store.setH2hLines(store.h2hLines.filter(line => line.id !== deletedLine.id))
    }
  }

  // Handle game changes
  private handleGameChange(payload: any) {
    if (!this.store) return
    const store = this.store
    
    if (payload.eventType === 'UPDATE') {
      const updatedGame = payload.new
      
      // Update live stream data if this is a live game
      if (updatedGame.status === 'live') {
        const liveStream = {
          t_sec: this.getGameTimeInSeconds(updatedGame),
          score_diff: updatedGame.away_score - updatedGame.home_score,
          pace: 75.2,
          to_rate: 0.12,
          hot_hand: 0.82,
          starter_on: 1,
          market: []
        }
        store.setLiveStream(liveStream)
      }
      
      // Update radar items
      if (updatedGame.status === 'live') {
        const radarItem = {
          propId: `LIVE_${updatedGame.away_team}_vs_${updatedGame.home_team}`,
          label: `${updatedGame.away_team} vs ${updatedGame.home_team}`,
          deltaVsMedian: 1.2,
          staleMin: 0,
          sport: "NCAA" as const
        }
        
        const currentRadar = store.radarItems
        const existingIndex = currentRadar.findIndex(item => item.propId === radarItem.propId)
        
        if (existingIndex >= 0) {
          currentRadar[existingIndex] = radarItem
        } else {
          currentRadar.push(radarItem)
        }
        
        store.setRadarItems([...currentRadar])
      }
    }
  }

  // Handle player stats changes
  private handlePlayerStatsChange(payload: any) {
    if (!this.store) return
    const store = this.store
    
    if (payload.eventType === 'UPDATE') {
      const updatedStats = payload.new
      
      // Update live stream with new player stats
      const currentLiveStream = store.liveStream
      if (currentLiveStream) {
        // Add player stats to market data
        const playerMarket = {
          prop: `player_${updatedStats.player_id}`,
          line: updatedStats.passing_yards || updatedStats.rushing_yards || updatedStats.receptions || 0,
          odds: 1.85,
          median_line: (updatedStats.passing_yards || updatedStats.rushing_yards || updatedStats.receptions || 0) * 0.9,
          last_change_ts: Date.now()
        }
        
        const updatedMarket = [...currentLiveStream.market, playerMarket]
        store.setLiveStream({
          ...currentLiveStream,
          market: updatedMarket
        })
      }
    }
  }

  // Handle H2H match changes
  private handleH2HMatchChange(payload: any) {
    if (!this.store) return
    const store = this.store
    
    if (payload.eventType === 'INSERT') {
      // New match created - reload bets
      store.loadBets()
    } else if (payload.eventType === 'UPDATE') {
      // Match updated - update specific match
      const updatedMatch = payload.new
      
      // Update the corresponding bet
      store.updateBet(updatedMatch.id, {
        status: this.mapMatchStatusToBetStatus(updatedMatch.status)
      })
    }
  }

  // Helper function to get game time in seconds
  private getGameTimeInSeconds(game: any): number {
    if (!game.time_remaining) return 0
    
    const [minutes, seconds] = game.time_remaining.split(':').map(Number)
    const quarterTime = (minutes * 60) + seconds
    
    let totalSeconds = 0
    switch (game.period) {
      case 'Q1': totalSeconds = (15 * 60) - quarterTime; break
      case 'Q2': totalSeconds = (30 * 60) - quarterTime; break
      case 'Q3': totalSeconds = (45 * 60) - quarterTime; break
      case 'Q4': totalSeconds = (60 * 60) - quarterTime; break
      case 'Final': totalSeconds = 60 * 60; break
    }
    
    return totalSeconds
  }

  // Helper function to map match status to bet status
  private mapMatchStatusToBetStatus(matchStatus: string): 'pending' | 'live' | 'won' | 'lost' {
    switch (matchStatus) {
      case 'matched': return 'pending'
      case 'live': return 'live'
      case 'settled': return 'won' // This would need winner logic
      default: return 'pending'
    }
  }

  // Check connection status
  isConnectedToRealtime(): boolean {
    return this.isConnected
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService()

// Export utility functions
export const startRealTimeUpdates = (store?: any) => {
  if (store) {
    realTimeService.initialize(store)
  }
  realTimeService.startSubscriptions()
}

export const stopRealTimeUpdates = () => {
  realTimeService.stopSubscriptions()
}