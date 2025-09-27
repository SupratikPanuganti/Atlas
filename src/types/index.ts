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
