// Utility functions for determining bet status based on game time and other factors

export interface GameTimeInfo {
  gameTime: string
  currentTime: Date
  gameStatus?: 'scheduled' | 'live' | 'finished' | 'postponed'
  period?: string
  timeRemaining?: string
}

export interface BetStatusInfo {
  status: 'pending' | 'live' | 'won' | 'lost' | 'cancelled'
  gameStatus: 'scheduled' | 'live' | 'finished' | 'postponed'
  timeUntilGame?: number // minutes until game starts
  timeSinceGame?: number // minutes since game ended
}

/**
 * Determines the current status of a bet based on game time and other factors
 */
export function determineBetStatus(gameTimeInfo: GameTimeInfo): BetStatusInfo {
  const { gameTime, currentTime, gameStatus, period, timeRemaining } = gameTimeInfo
  
  const gameDateTime = new Date(gameTime)
  const timeDiff = gameDateTime.getTime() - currentTime.getTime()
  const minutesUntilGame = Math.floor(timeDiff / (1000 * 60))
  
  // If game status is explicitly set, use that
  if (gameStatus) {
    switch (gameStatus) {
      case 'scheduled':
        return {
          status: 'pending',
          gameStatus: 'scheduled',
          timeUntilGame: minutesUntilGame
        }
      case 'live':
        return {
          status: 'live',
          gameStatus: 'live',
          timeUntilGame: 0
        }
      case 'finished':
        return {
          status: 'pending', // Will need final result to determine won/lost
          gameStatus: 'finished',
          timeSinceGame: Math.abs(minutesUntilGame)
        }
      case 'postponed':
        return {
          status: 'cancelled',
          gameStatus: 'postponed',
          timeUntilGame: minutesUntilGame
        }
    }
  }
  
  // If no explicit game status, determine based on time
  if (minutesUntilGame > 15) {
    // Game hasn't started yet (more than 15 minutes away)
    return {
      status: 'pending',
      gameStatus: 'scheduled',
      timeUntilGame: minutesUntilGame
    }
  } else if (minutesUntilGame > -15) {
    // Game is starting soon or just started (within 15 minutes of start time)
    return {
      status: 'live',
      gameStatus: 'live',
      timeUntilGame: Math.max(0, minutesUntilGame)
    }
  } else {
    // Game has been going on for a while or finished
    const minutesSinceGame = Math.abs(minutesUntilGame)
    
    if (minutesSinceGame > 180) { // More than 3 hours since start
      return {
        status: 'pending', // Will need final result to determine won/lost
        gameStatus: 'finished',
        timeSinceGame: minutesSinceGame
      }
    } else {
      return {
        status: 'live',
        gameStatus: 'live',
        timeSinceGame: minutesSinceGame
      }
    }
  }
}

/**
 * Updates bet status based on current time and game information
 */
export function updateBetStatus(
  currentStatus: string,
  gameTimeInfo: GameTimeInfo,
  finalValue?: number,
  line?: number,
  betType?: 'over' | 'under'
): BetStatusInfo {
  const statusInfo = determineBetStatus(gameTimeInfo)
  
  // If we have a final value and the game is finished, determine win/loss
  if (statusInfo.gameStatus === 'finished' && finalValue !== undefined && line !== undefined && betType) {
    const won = betType === 'over' ? finalValue > line : finalValue < line
    return {
      ...statusInfo,
      status: won ? 'won' : 'lost'
    }
  }
  
  return statusInfo
}

/**
 * Formats time until game or time since game
 */
export function formatGameTime(statusInfo: BetStatusInfo): string {
  if (statusInfo.timeUntilGame !== undefined) {
    if (statusInfo.timeUntilGame === 0) {
      return 'Starting now'
    } else if (statusInfo.timeUntilGame < 60) {
      return `In ${statusInfo.timeUntilGame}m`
    } else {
      const hours = Math.floor(statusInfo.timeUntilGame / 60)
      const minutes = statusInfo.timeUntilGame % 60
      return `In ${hours}h ${minutes}m`
    }
  }
  
  if (statusInfo.timeSinceGame !== undefined) {
    if (statusInfo.timeSinceGame < 60) {
      return `${statusInfo.timeSinceGame}m ago`
    } else {
      const hours = Math.floor(statusInfo.timeSinceGame / 60)
      const minutes = statusInfo.timeSinceGame % 60
      return `${hours}h ${minutes}m ago`
    }
  }
  
  return 'Unknown'
}

/**
 * Gets the appropriate status color for UI display
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'won': return '#10B981' // green
    case 'lost': return '#EF4444' // red
    case 'live': return '#F59E0B' // amber
    case 'pending': return '#3B82F6' // blue
    case 'cancelled': return '#6B7280' // gray
    default: return '#6B7280'
  }
}

/**
 * Gets the appropriate status text for UI display
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'won': return 'Won'
    case 'lost': return 'Lost'
    case 'live': return 'Live'
    case 'pending': return 'Pending'
    case 'cancelled': return 'Cancelled'
    default: return 'Unknown'
  }
}
