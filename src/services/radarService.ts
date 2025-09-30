import { databaseService } from './databaseService'
import type { RadarItem } from '../types'

// Real-time update interval (in milliseconds)
const UPDATE_INTERVAL = 30000 // 30 seconds

export const radarService = {
  // Cache for radar items to avoid repeated database calls
  radarCache: {} as { [key: string]: { items: RadarItem[], timestamp: number } },
  
  // Get dynamic radar items from database with filtering
  async getRadarItems(
    sport?: 'NCAA' | 'NFL',
    tab?: 'today' | 'suggestions',
    propTypes?: string[],
    deltaSign?: 'both' | 'positive' | 'negative'
  ): Promise<RadarItem[]> {
    try {
      console.log('radarService: Starting to get radar items...')
      
      // Test connection first
      const isConnected = await databaseService.testConnection()
      console.log('radarService: Database connection test result:', isConnected)
      
      if (!isConnected) {
        console.log('radarService: Database connection failed, using fallback data')
        return this.getFallbackRadarItems()
      }

      // Get betting lines from the new minimal database schema
      console.log('radarService: Fetching betting lines from database...')
      const bettingLines = await databaseService.getBettingLines()
      console.log('radarService: Got betting lines:', bettingLines?.length || 0)
      
      if (!bettingLines || bettingLines.length === 0) {
        console.log('radarService: No betting lines found in database, using fallback data')
        return this.getFallbackRadarItems()
      }

      console.log('radarService: Successfully loaded', bettingLines.length, 'betting lines from database')

      // Convert betting lines to radar items
      const radarItems: RadarItem[] = bettingLines.map(line => this.convertBettingLineToRadarItem(line))
      
      // Apply filters with detailed logging
      let filteredItems = radarItems
      console.log('radarService: Starting with', filteredItems.length, 'items')

      // Filter by sport
      if (sport) {
        const beforeCount = filteredItems.length
        console.log(`radarService: Before sport filter (${sport}):`, filteredItems.map(item => ({ label: item.label, sport: item.sport, staleMin: item.staleMin })))
        console.log(`radarService: Available sports in data:`, [...new Set(filteredItems.map(item => item.sport))])
        filteredItems = filteredItems.filter(item => {
          const matches = item.sport === sport
          if (!matches) {
            console.log(`radarService: Filtering out ${item.label} (sport: ${item.sport}, looking for: ${sport})`)
          }
          return matches
        })
        console.log(`radarService: After sport filter (${sport}):`, filteredItems.map(item => ({ label: item.label, sport: item.sport, staleMin: item.staleMin })))
        console.log(`radarService: Sport filter (${sport}): ${beforeCount} -> ${filteredItems.length}`)
      }

      // Filter by prop types (empty array means show all)
      if (propTypes && propTypes.length > 0) {
        const beforeCount = filteredItems.length
        filteredItems = filteredItems.filter(item => {
          const itemPropType = this.extractPropTypeFromLabel(item.label)
          const matches = propTypes.includes(itemPropType)
          if (!matches) {
            console.log(`radarService: Prop type filter - ${item.label} (${itemPropType}) not in [${propTypes.join(', ')}]`)
          }
          return matches
        })
        console.log(`radarService: Prop type filter: ${beforeCount} -> ${filteredItems.length}`)
      }

      // Filter by delta sign
      if (deltaSign && deltaSign !== 'both') {
        const beforeCount = filteredItems.length
        if (deltaSign === 'positive') {
          filteredItems = filteredItems.filter(item => item.deltaVsMedian > 1)
          console.log(`radarService: Delta filter (positive > 1): ${beforeCount} -> ${filteredItems.length}`)
        } else if (deltaSign === 'negative') {
          filteredItems = filteredItems.filter(item => item.deltaVsMedian < 1)
          console.log(`radarService: Delta filter (negative < 1): ${beforeCount} -> ${filteredItems.length}`)
        }
      }

      // Apply sorting based on tab
      if (tab === 'suggestions') {
        // Suggestions: Top 3 highest deltas, with time as tiebreaker
        console.log(`radarService: Sorting suggestions - before: ${filteredItems.length} items`)
        filteredItems = [...filteredItems]
          .sort((a, b) => {
            // First sort by delta (highest first)
            if (b.deltaVsMedian !== a.deltaVsMedian) {
              return b.deltaVsMedian - a.deltaVsMedian
            }
            // If deltas are equal, sort by most recently updated (lowest staleMin first)
            return a.staleMin - b.staleMin
          })
          .slice(0, 3) // Take only top 3
        console.log(`radarService: Suggestions sorted - after: ${filteredItems.length} items`)
      } else {
        // Today's lines: Sort by most recently updated to least recently updated
        console.log(`radarService: Sorting today's lines - before: ${filteredItems.length} items`)
        console.log('radarService: Items before sorting:', filteredItems.map(item => ({ label: item.label, staleMin: item.staleMin })))
        filteredItems = [...filteredItems].sort((a, b) => a.staleMin - b.staleMin)
        console.log('radarService: Items after sorting:', filteredItems.map(item => ({ label: item.label, staleMin: item.staleMin })))
        console.log(`radarService: Today's lines sorted - after: ${filteredItems.length} items`)
      }

      return filteredItems
      
    } catch (error) {
      console.error('Failed to get radar items:', error)
      return this.getFallbackRadarItems()
    }
  },

  // Convert betting line from database to radar item
  convertBettingLineToRadarItem(line: any): RadarItem {
    console.log('radarService: Converting betting line:', line)
    
    const propDisplayName = this.getPropDisplayName(line.prop_type)
    const label = `${line.player_name} ${propDisplayName} ${line.line} ${line.over_under}`
    
    // Calculate stale minutes from last_updated timestamp
    const now = new Date()
    const lastUpdated = new Date(line.last_updated)
    const staleMin = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60))
    
    const radarItem = {
      propId: `${line.prop_type}_${line.over_under}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`,
      label,
      deltaVsMedian: parseFloat(line.delta),
      staleMin: Math.max(0, staleMin), // Ensure non-negative
      sport: line.sport as 'NCAA' | 'NFL',
      bettingLineId: line.id, // Include the actual betting line ID
      player: line.player_name,
      prop: propDisplayName,
      line: parseFloat(line.line),
      confidence: line.suggested ? 0.8 : 0.6,
      volume: Math.floor(Math.random() * 1000) + 100,
      // Include the analysis and events fields for LiveScreen
      analysis: line.analysis,
      events: line.events,
      player_name: line.player_name,
      prop_type: line.prop_type,
      over_under: line.over_under
    }
    
    console.log('radarService: Converted to radar item:', radarItem)
    return radarItem
  },

  // Extract prop type from label for filtering
  extractPropTypeFromLabel(label: string): string {
    const propTypeMap: { [key: string]: string } = {
      'Pass Yds': 'pass_yards',
      'Rush Yds': 'rush_yards', 
      'Rec Yds': 'rec_yards',
      'Rec': 'receptions',
      'Pass TDs': 'pass_tds',
      'Rush TDs': 'rush_tds',
      'Rec TDs': 'rec_tds',
      'Pass Comp': 'pass_completions',
      'INT': 'interceptions',
      'Total TDs': 'total_tds'
    }
    
    for (const [displayName, propType] of Object.entries(propTypeMap)) {
      if (label.includes(displayName)) {
        return propType
      }
    }
    
    console.log(`radarService: Could not extract prop type from label: "${label}"`)
    return 'unknown'
  },

  // Generate a radar item for a specific game, player, and prop type
  async generateRadarItem(game: any, player: any, propType: string, gameStatus: 'live' | 'scheduled'): Promise<RadarItem | null> {
    try {
      // Get player stats if game is live
      let currentValue = 0
      if (gameStatus === 'live') {
        const playerStats = await databaseService.getPlayerStatsByGameAndPlayer(game.id, player.id)
        if (playerStats) {
          currentValue = this.getCurrentValueFromStats(playerStats, propType)
        }
      }
      
      // Generate realistic line based on player position and prop type
      const line = this.generateRealisticLine(player.position, propType)
      
      // Calculate delta vs median (simulate market movement)
      const deltaVsMedian = this.calculateDeltaVsMedian(currentValue, line, gameStatus)
      
      // Calculate stale minutes (how long since last update)
      const staleMin = gameStatus === 'live' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 60) + 30
      
      // Determine sport
      const sport = game.sport === 'football' ? (game.home_team.includes('Georgia Tech') || game.away_team.includes('Georgia Tech') ? 'NCAA' : 'NFL') : 'NFL'
      
      return {
        propId: `${propType.toUpperCase()}_over_${line}_${player.id}`,
        label: `${player.name} ${this.getPropDisplayName(propType)} ${line} o`,
        deltaVsMedian,
        staleMin,
        sport,
        player: player.name,
        prop: this.getPropDisplayName(propType),
        line,
        confidence: this.calculateConfidence(currentValue, line, gameStatus),
        volume: Math.floor(Math.random() * 1000) + 100
      }
    } catch (error) {
      console.error('Failed to generate radar item:', error)
      return null
    }
  },

  // Check if a prop type is valid for a player position
  isValidPropForPlayer(position: string, propType: string): boolean {
    const positionProps: { [key: string]: string[] } = {
      'QB': ['passing_yards', 'passing_tds', 'rushing_yards', 'rushing_tds'],
      'RB': ['rushing_yards', 'rushing_tds', 'receptions', 'receiving_tds'],
      'WR': ['receptions', 'receiving_tds', 'rushing_yards'],
      'TE': ['receptions', 'receiving_tds'],
      'K': ['rushing_yards'], // Placeholder
      'DEF': ['rushing_yards'] // Placeholder
    }
    
    return positionProps[position]?.includes(propType) || false
  },

  // Get current value from player stats
  getCurrentValueFromStats(playerStats: any, propType: string): number {
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

  // Generate realistic line based on position and prop type
  generateRealisticLine(position: string, propType: string): number {
    const lineRanges: { [key: string]: { [key: string]: [number, number] } } = {
      'QB': {
        'passing_yards': [200, 300],
        'passing_tds': [1.5, 3.5],
        'rushing_yards': [10, 50],
        'rushing_tds': [0.5, 1.5]
      },
      'RB': {
        'rushing_yards': [50, 120],
        'rushing_tds': [0.5, 2.5],
        'receptions': [2.5, 6.5],
        'receiving_tds': [0.5, 1.5]
      },
      'WR': {
        'receptions': [3.5, 8.5],
        'receiving_tds': [0.5, 1.5],
        'rushing_yards': [5, 25]
      },
      'TE': {
        'receptions': [2.5, 6.5],
        'receiving_tds': [0.5, 1.5]
      }
    }
    
    const range = lineRanges[position]?.[propType]
    if (range) {
      const [min, max] = range
      const value = min + Math.random() * (max - min)
      return Math.round(value * 2) / 2 // Round to nearest 0.5
    }
    
    return 50 // Default fallback
  },

  // Calculate delta vs median (market movement simulation)
  calculateDeltaVsMedian(currentValue: number, line: number, gameStatus: 'live' | 'scheduled'): number {
    if (gameStatus === 'live' && currentValue > 0) {
      // For live games, calculate based on current performance vs line
      const performance = currentValue / line
      return Math.max(0.5, Math.min(2.0, performance + (Math.random() - 0.5) * 0.4))
    } else {
      // For scheduled games, random market movement
      return 0.8 + Math.random() * 0.8 // Between 0.8 and 1.6
    }
  },

  // Calculate confidence based on current value and line
  calculateConfidence(currentValue: number, line: number, gameStatus: 'live' | 'scheduled'): number {
    if (gameStatus === 'live' && currentValue > 0) {
      const performance = currentValue / line
      return Math.max(0.3, Math.min(0.95, 0.7 + (performance - 1) * 0.2))
    }
    return 0.6 + Math.random() * 0.3 // Between 0.6 and 0.9
  },

  // Get display name for prop type
  getPropDisplayName(propType: string): string {
    const displayNames: { [key: string]: string } = {
      'pass_yards': 'Pass Yds',
      'rush_yards': 'Rush Yds',
      'rec_yards': 'Rec Yds',
      'receptions': 'Rec',
      'pass_tds': 'Pass TDs',
      'rush_tds': 'Rush TDs',
      'rec_tds': 'Rec TDs',
      'pass_completions': 'Pass Comp',
      'interceptions': 'INT',
      'total_tds': 'Total TDs'
    }
    
    return displayNames[propType] || propType
  },

  // Simulate dynamic updates to betting lines
  async simulateDynamicUpdates(): Promise<void> {
    try {
      console.log('radarService: Simulating dynamic updates to betting lines...')
      
      // Get current betting lines
      const bettingLines = await databaseService.getBettingLines()
      
      if (bettingLines && bettingLines.length > 0) {
        // Randomly update some lines to simulate market movement
        const linesToUpdate = bettingLines.filter(() => Math.random() < 0.3) // 30% chance to update
        
        for (const line of linesToUpdate) {
          // Simulate small changes to delta and last_updated
          const deltaChange = (Math.random() - 0.5) * 0.2 // ±0.1 change
          const newDelta = Math.max(0.1, Math.min(2.0, parseFloat(line.delta) + deltaChange))
          
          // Update the line in database (simulate)
          console.log(`radarService: Updating line ${line.id} - delta: ${line.delta} -> ${newDelta.toFixed(2)}`)
          
          // In a real implementation, you would update the database here
          // For now, we'll just log the change
        }
        
        // Clear cache to force fresh data on next load
        radarService.radarCache = {}
        console.log('radarService: Cleared radar cache to force fresh data')
      }
    } catch (error) {
      console.error('radarService: Error simulating dynamic updates:', error)
    }
  },

  // Start real-time updates
  startRealTimeUpdates(): void {
    console.log('radarService: Starting real-time updates...')
    
    // Update immediately
    radarService.simulateDynamicUpdates()
    
    // Set up interval for periodic updates
    setInterval(() => {
      radarService.simulateDynamicUpdates()
    }, UPDATE_INTERVAL)
  },

  // Stop real-time updates
  stopRealTimeUpdates(): void {
    console.log('radarService: Stopping real-time updates...')
    // In a real implementation, you would clear the interval here
  },

  // Fallback radar items if database fails - with variety for testing filters
  getFallbackRadarItems(): RadarItem[] {
    return [
      // NCAA items with varied deltas and stale times
      {
        propId: "PASS_YDS_over_225.5_king",
        label: "Haynes King Pass Yds 225.5 o",
        deltaVsMedian: 1.8,
        staleMin: 5,
        sport: "NCAA",
        analysis: "Strong matchup against Wake Forest secondary that allows 260+ yards per game",
        events: "King has thrown 250+ yards in 3 of last 4 games",
        player_name: "Haynes King",
        prop_type: "pass_yards",
        over_under: "over"
      },
      {
        propId: "RUSH_YDS_over_85.5_haynes",
        label: "Jamal Haynes Rush Yds 85.5 o",
        deltaVsMedian: 0.7,
        staleMin: 15,
        sport: "NCAA",
        analysis: "Wake Forest run defense allows 105+ yards to feature backs",
        events: "Haynes averages 98 yards per game",
        player_name: "Jamal Haynes",
        prop_type: "rush_yards",
        over_under: "over"
      },
      {
        propId: "REC_over_4.5_singleton",
        label: "Eric Singleton Rec 4.5 o",
        deltaVsMedian: 1.0,
        staleMin: 8,
        sport: "NCAA",
        analysis: "High-volume target in Georgia Tech's passing attack",
        events: "Singleton has 5+ receptions in 3 of 4 games",
        player_name: "Eric Singleton",
        prop_type: "receptions",
        over_under: "over"
      },
      {
        propId: "PASS_TD_over_1.5_king",
        label: "Haynes King Pass TD 1.5 o",
        deltaVsMedian: 2.0,
        staleMin: 3,
        sport: "NCAA"
      },
      {
        propId: "RUSH_TD_over_0.5_haynes",
        label: "Jamal Haynes Rush TD 0.5 o",
        deltaVsMedian: 0.5,
        staleMin: 25,
        sport: "NCAA"
      },
      // NFL items with varied deltas and stale times
      {
        propId: "PASS_YDS_over_275.5_allen",
        label: "Josh Allen Pass Yds 275.5 o",
        deltaVsMedian: 1.5,
        staleMin: 2,
        sport: "NFL"
      },
      {
        propId: "RUSH_YDS_over_95.5_jacobs",
        label: "Josh Jacobs Rush Yds 95.5 o",
        deltaVsMedian: 0.8,
        staleMin: 12,
        sport: "NFL"
      },
      {
        propId: "REC_over_6.5_diggs",
        label: "Stefon Diggs Rec 6.5 o",
        deltaVsMedian: 1.2,
        staleMin: 7,
        sport: "NFL"
      },
      {
        propId: "PASS_TD_over_2.5_mahomes",
        label: "Patrick Mahomes Pass TD 2.5 o",
        deltaVsMedian: 1.9,
        staleMin: 4,
        sport: "NFL"
      },
      {
        propId: "REC_TD_over_0.5_hill",
        label: "Tyreek Hill Rec TD 0.5 o",
        deltaVsMedian: 0.6,
        staleMin: 18,
        sport: "NFL"
      }
    ]
  }
}
