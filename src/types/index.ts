export interface PriceCardProps {
  propId: string
  worthPer1: number
  pFair: number
  fairPrice: number
  marketPrice: number
  mispricing: number
  evPer1: number
  thetaPer30s: number
  band: { lo: number; hi: number }
  fairOdds: number
  onExplain: () => void
}

export interface Driver {
  name: "pace" | "minutes" | "turnovers" | "usage" | "teammate_efficiency" | "defensive_pressure" | "hot_hand" | "foul_trouble" | "matchup" | "game_script"
  impact: number
  explanation?: string
  details?: string
}

export interface ExplainProps {
  drivers: Driver[]
  band: { lo: number; hi: number }
  brier?: number
  windows: { paceMin: number; minutesMin: number }
  lastUpdate: string
}

export interface RadarItem {
  propId: string
  label: string
  deltaVsMedian: number
  staleMin: number
  sport?: "NCAA" | "NFL"
}

export interface AlertBannerProps {
  title: string
  subtitle: string
  onView: () => void
  onSnooze: () => void
}

export interface LiveStreamData {
  t_sec: number
  score_diff: number
  pace: number
  to_rate: number
  hot_hand: number
  starter_on: number
  market: Array<{
    prop: string
    line: number
    odds: number
    median_line: number
    last_change_ts: number
  }>
}

export interface PricingData {
  prop: string
  p_fair: number
  fair_price: number
  market_price: number
  mispricing: number
  ev_per_1: number
  fair_odds: number
  band: { lo: number; hi: number }
  theta_per_30s: number
  drivers: Driver[]
}

// Betting-related types
export interface Bet {
  id: string
  prop: string
  player: string
  market: string
  line: number
  betType: 'over' | 'under'
  odds: number
  stake: number
  potentialWin: number
  status: 'pending' | 'live' | 'won' | 'lost'
  placedAt: string
  settledAt?: string
  gameInfo: {
    homeTeam: string
    awayTeam: string
    gameTime: string
    currentScore?: string
    quarter?: string
    timeRemaining?: string
  }
  currentValue?: number
  liveStats?: {
    current: number
    projected: number
    confidence: number
  }
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

export interface BettingDashboard {
  stats: BettingStats
  activeBets: Bet[]
  recentBets: Bet[]
  todayBets: Bet[]
}

// H2H (Head-to-Head) Types
export interface H2HLine {
  id: string
  creatorId: string
  sport: 'basketball' | 'football' | 'baseball' | 'soccer'
  game: {
    homeTeam: string
    awayTeam: string
    gameTime: string
    gameId: string
  }
  player: string
  propType: 'points' | 'assists' | 'rebounds' | 'passing_yards' | 'rushing_yards' | 'receptions' | 'goals' | 'saves'
  customLine: number
  side: 'over' | 'under'
  stakeCredits: number
  payoutMultiplier: number
  marketLine?: number
  fairValue?: number
  geminiAnalysis?: {
    fairValueExplanation: string
    suggestedAdjustment?: string
    matchLikelihood: number
  }
  status: 'open' | 'matched' | 'live' | 'settled' | 'cancelled'
  createdAt: string
  expiresAt: string
  matchedWith?: string // opponent user ID
  matchedAt?: string
  gameStarted?: boolean
  liveData?: {
    currentValue: number
    timeRemaining: string
    gameStatus: string
    lastUpdate: string
  }
  result?: {
    finalValue: number
    winner: 'creator' | 'opponent'
    settledAt: string
    geminiRecap?: string
  }
}

export interface H2HMatch {
  id: string
  lineId: string
  creatorId: string
  opponentId: string
  creatorSide: 'over' | 'under'
  opponentSide: 'over' | 'under'
  stakeCredits: number
  status: 'matched' | 'live' | 'settled'
  createdAt: string
  settledAt?: string
  winner?: 'creator' | 'opponent'
}

export interface H2HUser {
  id: string
  username: string
  avatar?: string
  credits: number
  stats: {
    totalMatches: number
    wins: number
    winRate: number
    avgStake: number
    totalCreditsWon: number
    totalCreditsLost: number
  }
}

export interface GeminiResponse {
  fairValue: number
  explanation: string
  confidence: number
  suggestedLine?: number
  marketComparison?: string
  riskAssessment?: string
}
