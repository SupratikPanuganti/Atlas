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
  onSensitivity: () => void
}

export interface Driver {
  name: "pace" | "minutes" | "turnovers" | "usage"
  impact: number
}

export interface ExplainProps {
  drivers: Driver[]
  band: { lo: number; hi: number }
  brier?: number
  windows: { paceMin: number; minutesMin: number }
  lastUpdate: string
  onCounterfactual: (what: string) => void
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
