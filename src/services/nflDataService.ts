import { databaseService } from './databaseService'
import { logger } from '../utils'

export interface NFLGameData {
  id: string
  homeTeam: string
  awayTeam: string
  gameTime: string
  status: 'scheduled' | 'live' | 'finished'
  homeScore?: number
  awayScore?: number
  period?: string
  timeRemaining?: string
}

export interface NFLPlayerData {
  id: string
  name: string
  team: string
  position: string
  seasonStats: {
    passing_yards: number
    rushing_yards: number
    receptions: number
    passing_tds: number
    rushing_tds: number
    receiving_tds: number
  }
}

export interface NFLHistoricalData {
  games: NFLGameData[]
  players: NFLPlayerData[]
  season: string
  week: number
}

export const nflDataService = {
  // Get current NFL season data
  async getCurrentNFLSeason(): Promise<NFLHistoricalData> {
    try {
      const games = await databaseService.getGames()
      const players = await databaseService.getPlayers()
      
      // Filter for NFL games (exclude NCAA)
      const nflGames = games.filter(game => 
        !game.home_team.includes('Georgia Tech') && 
        !game.home_team.includes('Wake Forest') &&
        !game.home_team.includes('Bulldogs') &&
        !game.home_team.includes('Crimson Tide') &&
        !game.home_team.includes('Buckeyes') &&
        !game.home_team.includes('Wolverines')
      )
      
      // Filter for NFL players
      const nflPlayers = players.filter(player => 
        !player.team.includes('Georgia Tech') && 
        !player.team.includes('Wake Forest') &&
        !player.team.includes('Bulldogs') &&
        !player.team.includes('Crimson Tide') &&
        !player.team.includes('Buckeyes') &&
        !player.team.includes('Wolverines')
      )
      
      return {
        games: nflGames.map(game => ({
          id: game.id,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          gameTime: game.game_time,
          status: game.status as 'scheduled' | 'live' | 'finished',
          homeScore: game.home_score,
          awayScore: game.away_score,
          period: game.period || undefined,
          timeRemaining: game.time_remaining || undefined
        })),
        players: nflPlayers.map(player => ({
          id: player.id,
          name: player.name,
          team: player.team,
          position: player.position || 'Unknown',
          seasonStats: {
            passing_yards: 0, // Would be populated from historical data
            rushing_yards: 0,
            receptions: 0,
            passing_tds: 0,
            rushing_tds: 0,
            receiving_tds: 0
          }
        })),
        season: '2024',
        week: 4 // Current week
      }
    } catch (error) {
      logger.error('Failed to get NFL season data:', error)
      throw error
    }
  },

  // Get NFL games for a specific week
  async getNFLGamesForWeek(week: number): Promise<NFLGameData[]> {
    try {
      const seasonData = await this.getCurrentNFLSeason()
      return seasonData.games.filter(game => {
        // Simple week filtering based on game time
        const gameDate = new Date(game.gameTime)
        const weekStart = new Date('2024-09-01') // Season start
        const weekNumber = Math.floor((gameDate.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
        return weekNumber === week
      })
    } catch (error) {
      logger.error(`Failed to get NFL games for week ${week}:`, error)
      throw error
    }
  },

  // Get NFL players by team
  async getNFLPlayersByTeam(team: string): Promise<NFLPlayerData[]> {
    try {
      const seasonData = await this.getCurrentNFLSeason()
      return seasonData.players.filter(player => 
        player.team.toLowerCase().includes(team.toLowerCase())
      )
    } catch (error) {
      logger.error(`Failed to get NFL players for team ${team}:`, error)
      throw error
    }
  },

  // Get NFL player stats for a specific game
  async getNFLPlayerStatsForGame(gameId: string): Promise<any[]> {
    try {
      return await databaseService.getPlayerStats(gameId)
    } catch (error) {
      logger.error(`Failed to get NFL player stats for game ${gameId}:`, error)
      throw error
    }
  },

  // Get NFL live games
  async getNFLLiveGames(): Promise<NFLGameData[]> {
    try {
      const liveGames = await databaseService.getLiveGames()
      return liveGames
        .filter(game => 
          !game.home_team.includes('Georgia Tech') && 
          !game.home_team.includes('Wake Forest') &&
          !game.home_team.includes('Bulldogs') &&
          !game.home_team.includes('Crimson Tide') &&
          !game.home_team.includes('Buckeyes') &&
          !game.home_team.includes('Wolverines')
        )
        .map(game => ({
          id: game.id,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          gameTime: game.game_time,
          status: game.status as 'scheduled' | 'live' | 'finished',
          homeScore: game.home_score,
          awayScore: game.away_score,
          period: game.period || undefined,
          timeRemaining: game.time_remaining || undefined
        }))
    } catch (error) {
      logger.error('Failed to get NFL live games:', error)
      throw error
    }
  },

  // Get NFL upcoming games
  async getNFLUpcomingGames(): Promise<NFLGameData[]> {
    try {
      const seasonData = await this.getCurrentNFLSeason()
      return seasonData.games.filter(game => game.status === 'scheduled')
    } catch (error) {
      logger.error('Failed to get NFL upcoming games:', error)
      throw error
    }
  },

  // Generate NFL betting lines (mock data for demo)
  generateNFLBettingLines(): any[] {
    return [
      {
        id: 'nfl_line_1',
        game: 'Kansas City Chiefs vs Buffalo Bills',
        player: 'Patrick Mahomes',
        prop: 'passing_yards',
        line: 275.5,
        side: 'over',
        odds: 1.90,
        marketLine: 270.0,
        fairValue: 280.0,
        confidence: 0.78
      },
      {
        id: 'nfl_line_2',
        game: 'Miami Dolphins vs New York Jets',
        player: 'Tua Tagovailoa',
        prop: 'passing_yards',
        line: 250.5,
        side: 'under',
        odds: 1.85,
        marketLine: 255.0,
        fairValue: 245.0,
        confidence: 0.72
      },
      {
        id: 'nfl_line_3',
        game: 'Philadelphia Eagles vs Dallas Cowboys',
        player: 'Jalen Hurts',
        prop: 'rushing_yards',
        line: 45.5,
        side: 'over',
        odds: 1.88,
        marketLine: 40.0,
        fairValue: 50.0,
        confidence: 0.75
      }
    ]
  },

  // Get NFL team standings (mock data)
  getNFLStandings(): any {
    return {
      AFC: {
        East: [
          { team: 'Buffalo Bills', wins: 3, losses: 1, pct: 0.750 },
          { team: 'Miami Dolphins', wins: 3, losses: 1, pct: 0.750 },
          { team: 'New York Jets', wins: 1, losses: 3, pct: 0.250 },
          { team: 'New England Patriots', wins: 1, losses: 3, pct: 0.250 }
        ],
        West: [
          { team: 'Kansas City Chiefs', wins: 3, losses: 1, pct: 0.750 },
          { team: 'Las Vegas Raiders', wins: 2, losses: 2, pct: 0.500 },
          { team: 'Denver Broncos', wins: 1, losses: 3, pct: 0.250 },
          { team: 'Los Angeles Chargers', wins: 1, losses: 3, pct: 0.250 }
        ]
      },
      NFC: {
        East: [
          { team: 'Philadelphia Eagles', wins: 4, losses: 0, pct: 1.000 },
          { team: 'Dallas Cowboys', wins: 3, losses: 1, pct: 0.750 },
          { team: 'Washington Commanders', wins: 2, losses: 2, pct: 0.500 },
          { team: 'New York Giants', wins: 1, losses: 3, pct: 0.250 }
        ],
        West: [
          { team: 'San Francisco 49ers', wins: 4, losses: 0, pct: 1.000 },
          { team: 'Seattle Seahawks', wins: 2, losses: 2, pct: 0.500 },
          { team: 'Los Angeles Rams', wins: 2, losses: 2, pct: 0.500 },
          { team: 'Arizona Cardinals', wins: 1, losses: 3, pct: 0.250 }
        ]
      }
    }
  }
}
