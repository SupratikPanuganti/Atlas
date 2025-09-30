import type { H2HLine } from '../types'

export interface LiveGameData {
  gameId: string
  status: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed'
  period: string // "Q1", "Q2", "Half", "Final", etc.
  timeRemaining: string
  homeScore: number
  awayScore: number
  players: {
    [playerId: string]: {
      name: string
      stats: {
        [statType: string]: number // points, assists, rebounds, etc.
      }
    }
  }
  lastUpdate: string
}

export interface MatchedLineData {
  lineId: string
  gameId: string
  player: string
  propType: string
  line: number
  side: 'over' | 'under'
  currentValue: number
  needsValue: number // How much more needed to hit the line
  hitProbability: number // 0-1 probability of hitting based on current pace
}

class LiveTrackingService {
  private gameDataCache = new Map<string, LiveGameData>()
  private updateIntervals = new Map<string, NodeJS.Timeout>()
  private subscribers = new Set<(data: LiveGameData) => void>()

  // Mock API endpoints - replace with real sports data API
  private readonly SPORTS_API_BASE = 'https://api.sportsdata.io/v3'
  private readonly API_KEY = 'your_sports_api_key_here'

  constructor() {
    // Auto-cleanup old intervals
    setInterval(() => this.cleanupOldIntervals(), 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Start tracking a game for H2H lines
   */
  startTrackingGame(gameId: string): void {
    if (this.updateIntervals.has(gameId)) {
      return // Already tracking
    }

    // Initial fetch
    this.fetchGameData(gameId)

    // Set up live updates every 10 seconds for live games
    const interval = setInterval(() => {
      this.fetchGameData(gameId)
    }, 10000)

    this.updateIntervals.set(gameId, interval)
  }

  /**
   * Stop tracking a game
   */
  stopTrackingGame(gameId: string): void {
    const interval = this.updateIntervals.get(gameId)
    if (interval) {
      clearInterval(interval)
      this.updateIntervals.delete(gameId)
    }
    this.gameDataCache.delete(gameId)
  }

  /**
   * Get current game data
   */
  getGameData(gameId: string): LiveGameData | null {
    return this.gameDataCache.get(gameId) || null
  }

  /**
   * Subscribe to live game updates
   */
  subscribe(callback: (data: LiveGameData) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Check if a line should be settled
   */
  checkLineSettlement(line: H2HLine): { shouldSettle: boolean; finalValue?: number } {
    const gameData = this.getGameData(line.game.gameId)
    if (!gameData || gameData.status !== 'finished') {
      return { shouldSettle: false }
    }

    const player = gameData.players[this.getPlayerKey(line.player)]
    if (!player) {
      console.warn(`Player ${line.player} not found in game data`)
      return { shouldSettle: false }
    }

    const finalValue = player.stats[this.mapPropTypeToStat(line.propType)]
    if (finalValue === undefined) {
      console.warn(`Stat ${line.propType} not found for player ${line.player}`)
      return { shouldSettle: false }
    }

    return { shouldSettle: true, finalValue }
  }

  /**
   * Get line analysis for live games
   */
  analyzeMatchedLine(line: H2HLine): MatchedLineData | null {
    const gameData = this.getGameData(line.game.gameId)
    if (!gameData) return null

    const player = gameData.players[this.getPlayerKey(line.player)]
    if (!player) return null

    const currentValue = player.stats[this.mapPropTypeToStat(line.propType)] || 0
    const needsValue = line.side === 'over' 
      ? Math.max(0, line.customLine - currentValue + 0.1) // Need to exceed the line
      : Math.max(0, currentValue - line.customLine + 0.1) // Need to stay under

    const hitProbability = this.calculateHitProbability(
      line, 
      currentValue, 
      gameData.period, 
      gameData.timeRemaining
    )

    return {
      lineId: line.id,
      gameId: line.game.gameId,
      player: line.player,
      propType: line.propType,
      line: line.customLine,
      side: line.side,
      currentValue,
      needsValue,
      hitProbability
    }
  }

  /**
   * Fetch game data from API
   */
  private async fetchGameData(gameId: string): Promise<void> {
    try {
      // In production, replace with real API call
      const mockData = this.generateMockGameData(gameId)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
      
      this.gameDataCache.set(gameId, mockData)
      
      // Notify subscribers
      this.subscribers.forEach(callback => callback(mockData))
      
    } catch (error) {
      console.error(`Failed to fetch game data for ${gameId}:`, error)
    }
  }

  /**
   * Generate mock game data for development
   */
  private generateMockGameData(gameId: string): LiveGameData {
    const existing = this.gameDataCache.get(gameId)
    const isFirstFetch = !existing

    // Game progression simulation
    let status: LiveGameData['status'] = 'live'
    let period = 'Q2'
    let timeRemaining = '8:32'
    let homeScore = 65
    let awayScore = 62

    if (existing) {
      // Progress the game
      const gameMinutesElapsed = this.getGameMinutesElapsed(existing.period, existing.timeRemaining)
      const newMinutesElapsed = gameMinutesElapsed + 0.17 // ~10 seconds per update

      if (newMinutesElapsed >= 48) { // Full game
        status = 'finished'
        period = 'Final'
        timeRemaining = '0:00'
      } else if (newMinutesElapsed >= 24) {
        period = newMinutesElapsed >= 36 ? 'Q4' : 'Q3'
        const quarterMinutes = newMinutesElapsed % 12
        timeRemaining = `${Math.floor(12 - quarterMinutes)}:${Math.floor((60 - (quarterMinutes * 60) % 60) / 10)}${(60 - (quarterMinutes * 60) % 60) % 10}`
      }

      homeScore = existing.homeScore + (Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0)
      awayScore = existing.awayScore + (Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0)
    }

    return {
      gameId,
      status,
      period,
      timeRemaining,
      homeScore,
      awayScore,
      players: {
        'carson_beck': {
          name: 'Carson Beck',
          stats: {
            passing_yards: isFirstFetch ? 185 : Math.min(400, (existing?.players?.['carson_beck']?.stats?.passing_yards || 185) + (Math.random() < 0.05 ? Math.floor(Math.random() * 25) : 0)),
            rushing_yards: isFirstFetch ? 12 : Math.min(50, (existing?.players?.['carson_beck']?.stats?.rushing_yards || 12) + (Math.random() < 0.03 ? Math.floor(Math.random() * 8) : 0)),
            passing_tds: isFirstFetch ? 1 : Math.min(5, (existing?.players?.['carson_beck']?.stats?.passing_tds || 1) + (Math.random() < 0.02 ? 1 : 0)),
          }
        },
        'jalen_milroe': {
          name: 'Jalen Milroe',
          stats: {
            passing_yards: isFirstFetch ? 165 : Math.min(350, (existing?.players?.['jalen_milroe']?.stats?.passing_yards || 165) + (Math.random() < 0.04 ? Math.floor(Math.random() * 20) : 0)),
            rushing_yards: isFirstFetch ? 28 : Math.min(80, (existing?.players?.['jalen_milroe']?.stats?.rushing_yards || 28) + (Math.random() < 0.05 ? Math.floor(Math.random() * 12) : 0)),
            passing_tds: isFirstFetch ? 1 : Math.min(4, (existing?.players?.['jalen_milroe']?.stats?.passing_tds || 1) + (Math.random() < 0.02 ? 1 : 0)),
          }
        },
        'kendall_milton': {
          name: 'Kendall Milton',
          stats: {
            rushing_yards: isFirstFetch ? 45 : Math.min(150, (existing?.players?.['kendall_milton']?.stats?.rushing_yards || 45) + (Math.random() < 0.06 ? Math.floor(Math.random() * 15) : 0)),
            receptions: isFirstFetch ? 2 : Math.min(8, (existing?.players?.['kendall_milton']?.stats?.receptions || 2) + (Math.random() < 0.03 ? 1 : 0)),
            receiving_yards: isFirstFetch ? 18 : Math.min(60, (existing?.players?.['kendall_milton']?.stats?.receiving_yards || 18) + (Math.random() < 0.04 ? Math.floor(Math.random() * 12) : 0)),
          }
        }
      },
      lastUpdate: new Date().toISOString()
    }
  }

  /**
   * Calculate probability of line hitting based on current pace
   */
  private calculateHitProbability(
    line: H2HLine, 
    currentValue: number, 
    period: string, 
    timeRemaining: string
  ): number {
    const gameProgress = this.getGameProgress(period, timeRemaining)
    const currentPace = currentValue / Math.max(gameProgress, 0.01) // Avoid division by zero
    
    // Project final value based on current pace
    const projectedFinal = currentPace * 1.0 // Full game
    
    // Calculate probability based on how close projected value is to line
    const difference = line.side === 'over' 
      ? projectedFinal - line.customLine
      : line.customLine - projectedFinal

    // Convert difference to probability (sigmoid function)
    const probability = 1 / (1 + Math.exp(-difference * 2))
    
    return Math.max(0, Math.min(1, probability))
  }

  /**
   * Get game progress as a percentage (0-1)
   */
  private getGameProgress(period: string, timeRemaining: string): number {
    if (period === 'Final') return 1.0
    
    const [minutes, seconds] = timeRemaining.split(':').map(Number)
    const totalSeconds = minutes * 60 + seconds
    
    switch (period) {
      case 'Q1': return (12 * 60 - totalSeconds) / (48 * 60)
      case 'Q2': return (24 * 60 - totalSeconds) / (48 * 60)
      case 'Q3': return (36 * 60 - totalSeconds) / (48 * 60)
      case 'Q4': return (48 * 60 - totalSeconds) / (48 * 60)
      default: return 0.5
    }
  }

  /**
   * Get total minutes elapsed in game
   */
  private getGameMinutesElapsed(period: string, timeRemaining: string): number {
    const progress = this.getGameProgress(period, timeRemaining)
    return progress * 48 // 48 minutes total game time
  }

  /**
   * Convert player name to key
   */
  private getPlayerKey(playerName: string): string {
    return playerName.toLowerCase().replace(' ', '_')
  }

  /**
   * Map prop type to stat key
   */
  private mapPropTypeToStat(propType: string): string {
    const mapping: { [key: string]: string } = {
      'points': 'points',
      'assists': 'assists',
      'rebounds': 'rebounds',
      'passing_yards': 'passing_yards',
      'rushing_yards': 'rushing_yards',
      'receptions': 'receptions'
    }
    return mapping[propType] || propType
  }

  /**
   * Clean up old intervals for finished games
   */
  private cleanupOldIntervals(): void {
    for (const [gameId, interval] of this.updateIntervals.entries()) {
      const gameData = this.gameDataCache.get(gameId)
      if (gameData && (gameData.status === 'finished' || gameData.status === 'postponed')) {
        clearInterval(interval)
        this.updateIntervals.delete(gameId)
        
        // Keep game data for 1 hour after game ends for settlement
        setTimeout(() => {
          this.gameDataCache.delete(gameId)
        }, 60 * 60 * 1000)
      }
    }
  }
}

// Export singleton instance
export const liveTrackingService = new LiveTrackingService()

// Export utility functions
export const startGameTracking = (gameId: string) => {
  liveTrackingService.startTrackingGame(gameId)
}

export const stopGameTracking = (gameId: string) => {
  liveTrackingService.stopTrackingGame(gameId)
}

export const getGameData = (gameId: string) => {
  return liveTrackingService.getGameData(gameId)
}

export const subscribeToGameUpdates = (callback: (data: LiveGameData) => void) => {
  return liveTrackingService.subscribe(callback)
}
