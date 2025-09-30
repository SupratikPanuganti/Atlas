import { supabase } from '../lib/supabase'

interface GameState {
  gameId: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  period: string
  timeRemaining: string
  status: 'scheduled' | 'live' | 'halftime' | 'finished'
  players: {
    [playerId: string]: {
      name: string
      stats: {
        passing_yards: number
        rushing_yards: number
        receptions: number
        passing_tds: number
        rushing_tds: number
        receiving_tds: number
      }
    }
  }
}

class LiveSimulationService {
  private gameState: GameState | null = null
  private simulationInterval: NodeJS.Timeout | null = null
  private isRunning = false
  private simulationSpeed = 2000 // 2 seconds per update (2-minute simulation)
  private store: any = null

  // Initialize with store reference
  initialize(store: any) {
    this.store = store
  }

  // Georgia Tech vs Wake Forest game data (9/27/2024)
  private readonly NCAA_GAME_DATA = {
    gameId: 'bf7a87b2-de79-4509-9911-79d6022da5b1', // Use existing game ID from database
    homeTeam: 'Wake Forest Demon Deacons',
    awayTeam: 'Georgia Tech Yellow Jackets',
    homeScore: 7,
    awayScore: 14,
    period: 'Q2',
    timeRemaining: '8:45',
    status: 'live' as const,
    players: {
      'c3234276-4345-4d37-88b3-a98629daec5d': { // Haynes King
        name: 'Haynes King',
        stats: {
          passing_yards: 145,
          rushing_yards: 12,
          receptions: 0,
          passing_tds: 1,
          rushing_tds: 0,
          receiving_tds: 0
        }
      },
      '9b99e1a1-5728-4a7a-ae4c-760240ed398e': { // Jamal Haynes
        name: 'Jamal Haynes',
        stats: {
          passing_yards: 0,
          rushing_yards: 45,
          receptions: 2,
          passing_tds: 0,
          rushing_tds: 1,
          receiving_tds: 0
        }
      },
      '3580d08b-d9a1-480f-acba-1dca0e4f5b15': { // Eric Singleton Jr.
        name: 'Eric Singleton Jr.',
        stats: {
          passing_yards: 0,
          rushing_yards: 0,
          receptions: 3,
          passing_tds: 0,
          rushing_tds: 0,
          receiving_tds: 0
        }
      },
      '248e1b21-ac02-4a21-9085-451ce16e60d8': { // Mitch Griffis
        name: 'Mitch Griffis',
        stats: {
          passing_yards: 98,
          rushing_yards: 8,
          receptions: 0,
          passing_tds: 0,
          rushing_tds: 0,
          receiving_tds: 0
        }
      },
      '430989d2-1b7e-4838-aa18-bbec611d7d29': { // Demond Claiborne
        name: 'Demond Claiborne',
        stats: {
          passing_yards: 0,
          rushing_yards: 32,
          receptions: 1,
          passing_tds: 0,
          rushing_tds: 0,
          receiving_tds: 0
        }
      }
    }
  }

  // Start the live simulation
  startSimulation() {
    if (this.isRunning) return

    console.log('🏈 Starting NCAA live simulation: Georgia Tech vs Wake Forest')
    this.isRunning = true
    this.gameState = { ...this.NCAA_GAME_DATA }

    // Start the simulation loop
    this.simulationInterval = setInterval(() => {
      this.updateGameState()
    }, this.simulationSpeed)

    // Initial update
    this.updateGameState()
    
    // Update database with live game state
    this.updateDatabaseWithLiveState()
  }

  // Stop the simulation
  stopSimulation() {
    if (!this.isRunning) return

    console.log('🏈 Stopping NCAA live simulation')
    this.isRunning = false
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }

  // Update game state with realistic progression
  private updateGameState() {
    if (!this.gameState) return

    const state = this.gameState
    if (!this.store) return
    const store = this.store

    // Simulate realistic game progression
    this.simulateGameEvents(state)
    this.updatePlayerStats(state)
    this.updateGameTime(state)

    // Update the store with new data
    this.updateStoreWithGameState(state)

    // Log current state
    console.log(`🏈 ${state.awayTeam} ${state.awayScore} - ${state.homeTeam} ${state.homeScore} (${state.period} ${state.timeRemaining})`)
    console.log(`📊 Haynes King: ${state.players['c3234276-4345-4d37-88b3-a98629daec5d'].stats.passing_yards} pass yds, ${state.players['c3234276-4345-4d37-88b3-a98629daec5d'].stats.rushing_yards} rush yds`)
    console.log(`📊 Jamal Haynes: ${state.players['9b99e1a1-5728-4a7a-ae4c-760240ed398e'].stats.rushing_yards} rush yds, ${state.players['9b99e1a1-5728-4a7a-ae4c-760240ed398e'].stats.receptions} rec`)
  }

  // Simulate realistic game events
  private simulateGameEvents(state: GameState) {
    const random = Math.random()

    // Score updates (10% chance per update)
    if (random < 0.1) {
      if (random < 0.05) {
        // Georgia Tech scores
        state.awayScore += Math.random() < 0.7 ? 7 : 3 // 70% TD, 30% FG
        console.log(`🎯 ${state.awayTeam} scores!`)
      } else {
        // Wake Forest scores
        state.homeScore += Math.random() < 0.7 ? 7 : 3
        console.log(`🎯 ${state.homeTeam} scores!`)
      }
    }
  }

  // Update player stats realistically
  private updatePlayerStats(state: GameState) {
    // Haynes King (QB) - passing and rushing
    if (Math.random() < 0.3) {
      state.players['c3234276-4345-4d37-88b3-a98629daec5d'].stats.passing_yards += Math.floor(Math.random() * 15) + 5 // 5-20 yards
    }
    if (Math.random() < 0.1) {
      state.players['c3234276-4345-4d37-88b3-a98629daec5d'].stats.rushing_yards += Math.floor(Math.random() * 8) + 2 // 2-10 yards
    }
    if (Math.random() < 0.05) {
      state.players['c3234276-4345-4d37-88b3-a98629daec5d'].stats.passing_tds += 1
      console.log(`🏈 Haynes King passing TD!`)
    }

    // Jamal Haynes (RB) - rushing and receiving
    if (Math.random() < 0.4) {
      state.players['9b99e1a1-5728-4a7a-ae4c-760240ed398e'].stats.rushing_yards += Math.floor(Math.random() * 12) + 3 // 3-15 yards
    }
    if (Math.random() < 0.2) {
      state.players['9b99e1a1-5728-4a7a-ae4c-760240ed398e'].stats.receptions += 1
    }
    if (Math.random() < 0.03) {
      state.players['9b99e1a1-5728-4a7a-ae4c-760240ed398e'].stats.rushing_tds += 1
      console.log(`🏈 Jamal Haynes rushing TD!`)
    }

    // Eric Singleton (WR) - receiving
    if (Math.random() < 0.25) {
      state.players['3580d08b-d9a1-480f-acba-1dca0e4f5b15'].stats.receptions += 1
    }

    // Wake Forest players
    if (Math.random() < 0.2) {
      state.players['248e1b21-ac02-4a21-9085-451ce16e60d8'].stats.passing_yards += Math.floor(Math.random() * 12) + 3
    }
    if (Math.random() < 0.3) {
      state.players['430989d2-1b7e-4838-aa18-bbec611d7d29'].stats.rushing_yards += Math.floor(Math.random() * 10) + 2
    }
  }

  // Update game time and periods
  private updateGameTime(state: GameState) {
    const [minutes, seconds] = state.timeRemaining.split(':').map(Number)
    let totalSeconds = minutes * 60 + seconds

    // Decrease time by 30 seconds per update (simulated)
    totalSeconds = Math.max(0, totalSeconds - 30)

    if (totalSeconds === 0) {
      // End of quarter
      if (state.period === 'Q1') {
        state.period = 'Q2'
        state.timeRemaining = '15:00'
      } else if (state.period === 'Q2') {
        state.period = 'Q3'
        state.timeRemaining = '15:00'
      } else if (state.period === 'Q3') {
        state.period = 'Q4'
        state.timeRemaining = '15:00'
      } else if (state.period === 'Q4') {
        // Game over - final score should be 30-29 Georgia Tech
        state.period = 'Final'
        state.timeRemaining = '0:00'
        state.status = 'finished'
        state.awayScore = 30
        state.homeScore = 29
        this.stopSimulation()
        console.log('🏁 Game Over! Georgia Tech 30 - Wake Forest 29')
        return
      }
    } else {
      const newMinutes = Math.floor(totalSeconds / 60)
      const newSeconds = totalSeconds % 60
      state.timeRemaining = `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`
    }
  }

  // Update the store with current game state
  private updateStoreWithGameState(state: GameState) {
    if (!this.store) return
    const store = this.store

    // Update live stream data
    const liveStream = {
      t_sec: this.getGameTimeInSeconds(state),
      score_diff: state.awayScore - state.homeScore,
      pace: 75.2,
      to_rate: 0.12,
      hot_hand: 0.82,
      starter_on: 1,
      market: Object.values(state.players).map(player => ({
        prop: `${player.name}_${player.stats.passing_yards || player.stats.rushing_yards || player.stats.receptions}`,
        line: player.stats.passing_yards || player.stats.rushing_yards || player.stats.receptions || 0,
        odds: 1.85,
        median_line: (player.stats.passing_yards || player.stats.rushing_yards || player.stats.receptions || 0) * 0.9,
        last_change_ts: Date.now()
      }))
    }

    store.setLiveStream(liveStream)

    // Update radar items with live game
    const radarItems = [
      {
        propId: `LIVE_${state.awayTeam}_vs_${state.homeTeam}`,
        label: `${state.awayTeam} vs ${state.homeTeam}`,
        deltaVsMedian: 1.2,
        staleMin: 0,
        sport: "NCAA" as const
      }
    ]
    store.setRadarItems(radarItems)

    // Update connection status
    store.setConnectionStatus(true)
  }

  // Get game time in seconds for live stream
  private getGameTimeInSeconds(state: GameState): number {
    const [minutes, seconds] = state.timeRemaining.split(':').map(Number)
    const quarterTime = (minutes * 60) + seconds
    
    let totalSeconds = 0
    switch (state.period) {
      case 'Q1': totalSeconds = (15 * 60) - quarterTime; break
      case 'Q2': totalSeconds = (30 * 60) - quarterTime; break
      case 'Q3': totalSeconds = (45 * 60) - quarterTime; break
      case 'Q4': totalSeconds = (60 * 60) - quarterTime; break
      case 'Final': totalSeconds = 60 * 60; break
    }
    
    return totalSeconds
  }

  // Update database with live game state
  private async updateDatabaseWithLiveState() {
    if (!this.gameState) return

    try {
      // Update game status in database
      await supabase
        .from('games')
        .update({
          status: this.gameState.status,
          period: this.gameState.period,
          time_remaining: this.gameState.timeRemaining,
          home_score: this.gameState.homeScore,
          away_score: this.gameState.awayScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.gameState.gameId)

      // Update player stats in database
      for (const [playerId, playerData] of Object.entries(this.gameState.players)) {
        await supabase
          .from('player_stats')
          .upsert({
            game_id: this.gameState.gameId,
            player_id: playerId,
            passing_yards: playerData.stats.passing_yards,
            rushing_yards: playerData.stats.rushing_yards,
            receptions: playerData.stats.receptions,
            passing_tds: playerData.stats.passing_tds,
            rushing_tds: playerData.stats.rushing_tds,
            receiving_tds: playerData.stats.receiving_tds,
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Failed to update database with live state:', error)
    }
  }

  // Get current game state
  getGameState(): GameState | null {
    return this.gameState
  }

  // Check if simulation is running
  isSimulationRunning(): boolean {
    return this.isRunning
  }
}

// Export singleton instance
export const liveSimulationService = new LiveSimulationService()

// Export utility functions
export const startNCAA_Simulation = (store?: any) => {
  if (store) {
    liveSimulationService.initialize(store)
  }
  liveSimulationService.startSimulation()
}

export const stopNCAA_Simulation = () => {
  liveSimulationService.stopSimulation()
}

export const getNCAA_GameState = () => {
  return liveSimulationService.getGameState()
}
