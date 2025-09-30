import { databaseService } from './databaseService'
import { openaiService } from './openaiService'
import { geminiService } from './geminiService'
import type { PricingData } from '../types'

export const pricingService = {
  // Get real-time pricing data for a specific prop
  async getPricingData(propId: string, gameId?: string, playerId?: string): Promise<PricingData> {
    try {
      // Try to get real pricing data from database first
      if (gameId && playerId) {
        const game = await databaseService.getGameById(gameId)
        const player = await databaseService.getPlayerById(playerId)
        
        if (game && player) {
          // Get live player stats if game is live
          if (game.status === 'live') {
            const playerStats = await databaseService.getPlayerStatsByGameAndPlayer(gameId, playerId)
            
            if (playerStats) {
              // Calculate real-time pricing based on current stats
              const currentValue = this.calculateCurrentValue(propId, playerStats)
              const projectedValue = this.calculateProjectedValue(propId, playerStats, game)
              
              return {
                propId,
                player: player.name,
                prop: this.getPropDisplayName(propId),
                line: this.extractLineFromPropId(propId),
                overOdds: 1.85, // This would come from real market data
                underOdds: 1.95,
                lastUpdate: new Date().toISOString(),
                confidence: this.calculateConfidence(currentValue, projectedValue),
                volume: Math.floor(Math.random() * 1000) + 100, // Mock volume data
                movement: this.calculateMovement(currentValue, projectedValue)
              }
            }
          }
        }
      }
      
      // Fallback to AI-generated pricing if no real data available
      return await this.generateAIPricing(propId)
      
    } catch (error) {
      console.error('Failed to get pricing data:', error)
      // Final fallback to basic pricing
      return this.getBasicPricing(propId)
    }
  },

  // Calculate current value based on player stats
  calculateCurrentValue(propId: string, playerStats: any): number {
    const propType = this.extractPropType(propId)
    
    switch (propType) {
      case 'passing_yards':
        return playerStats.passing_yards || 0
      case 'rushing_yards':
        return playerStats.rushing_yards || 0
      case 'receptions':
        return playerStats.receptions || 0
      case 'passing_tds':
        return playerStats.passing_tds || 0
      case 'rushing_tds':
        return playerStats.rushing_tds || 0
      case 'receiving_tds':
        return playerStats.receiving_tds || 0
      default:
        return 0
    }
  },

  // Calculate projected value based on current stats and game context
  calculateProjectedValue(propId: string, playerStats: any, game: any): number {
    const currentValue = this.calculateCurrentValue(propId, playerStats)
    const propType = this.extractPropType(propId)
    
    // Simple projection based on game time remaining
    const gameTimeRemaining = this.getGameTimeRemaining(game)
    const projectionMultiplier = gameTimeRemaining > 0 ? (60 / gameTimeRemaining) : 1
    
    return currentValue * projectionMultiplier
  },

  // Calculate confidence based on current vs projected values
  calculateConfidence(currentValue: number, projectedValue: number): number {
    const variance = Math.abs(projectedValue - currentValue) / Math.max(currentValue, 1)
    return Math.max(0.1, Math.min(1.0, 1 - variance))
  },

  // Calculate movement based on current vs projected values
  calculateMovement(currentValue: number, projectedValue: number): number {
    return projectedValue - currentValue
  },

  // Get game time remaining in minutes
  getGameTimeRemaining(game: any): number {
    if (game.status !== 'live') return 0
    
    // Simple calculation - in real implementation, this would parse the actual time remaining
    const period = game.period || 'Q1'
    const quarter = parseInt(period.replace('Q', '')) || 1
    const timeRemaining = game.time_remaining || '15:00'
    
    // Convert time remaining to minutes
    const [minutes, seconds] = timeRemaining.split(':').map(Number)
    const currentQuarterTime = minutes + (seconds / 60)
    
    // Calculate total time remaining (assuming 15-minute quarters)
    const quartersRemaining = 4 - quarter
    const totalTimeRemaining = (quartersRemaining * 15) + currentQuarterTime
    
    return totalTimeRemaining
  },

  // Generate AI-powered pricing when no real data is available
  async generateAIPricing(propId: string): Promise<PricingData> {
    try {
      const propType = this.extractPropType(propId)
      const line = this.extractLineFromPropId(propId)
      
      // Use Gemini to analyze the prop and generate fair pricing
      const analysis = await geminiService.analyzePlayerProp(
        'Sample Player', // This would be the actual player name
        propType,
        line
      )
      
      return {
        propId,
        player: 'Sample Player',
        prop: this.getPropDisplayName(propId),
        line,
        overOdds: 1.85,
        underOdds: 1.95,
        lastUpdate: new Date().toISOString(),
        confidence: analysis.confidence,
        volume: Math.floor(Math.random() * 500) + 50,
        movement: Math.random() * 2 - 1 // Random movement between -1 and 1
      }
    } catch (error) {
      console.error('Failed to generate AI pricing:', error)
      return this.getBasicPricing(propId)
    }
  },

  // Basic fallback pricing
  getBasicPricing(propId: string): PricingData {
    return {
      propId,
      player: 'Player',
      prop: this.getPropDisplayName(propId),
      line: this.extractLineFromPropId(propId),
      overOdds: 1.85,
      underOdds: 1.95,
      lastUpdate: new Date().toISOString(),
      confidence: 0.7,
      volume: 100,
      movement: 0
    }
  },

  // Extract prop type from prop ID
  extractPropType(propId: string): string {
    const parts = propId.split('_')
    if (parts.length >= 3) {
      const propType = parts[0] + '_' + parts[1] // e.g., "PASS_YDS"
      return propType.toLowerCase()
    }
    return 'passing_yards'
  },

  // Extract line value from prop ID
  extractLineFromPropId(propId: string): number {
    const parts = propId.split('_')
    if (parts.length >= 3) {
      return parseFloat(parts[2]) || 0
    }
    return 0
  },

  // Get display name for prop type
  getPropDisplayName(propId: string): string {
    const propType = this.extractPropType(propId)
    
    const displayNames: { [key: string]: string } = {
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards',
      'receptions': 'Receptions',
      'passing_tds': 'Passing TDs',
      'rushing_tds': 'Rushing TDs',
      'receiving_tds': 'Receiving TDs'
    }
    
    return displayNames[propType] || 'Unknown Prop'
  }
}
