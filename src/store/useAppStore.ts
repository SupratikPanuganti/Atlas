import { create } from "zustand"
import type { PricingData, LiveStreamData, RadarItem, Bet, BettingStats, BettingDashboard } from "../types"

interface AppState {
  // Authentication
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    name: string
  } | null

  // Live data
  currentPricing: PricingData | null
  liveStream: LiveStreamData | null
  isConnected: boolean

  // Radar data
  radarItems: RadarItem[]

  // UI state
  showAlert: boolean
  alertData: {
    title: string
    subtitle: string
  } | null

  // Settings
  mispricingThreshold: number
  minConfidence: number

  // Betting data
  bets: Bet[]
  bettingStats: BettingStats | null
  bettingDashboard: BettingDashboard | null

  // UI-marked favorites (starred stale lines)
  starredPropIds: string[]

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  setCurrentPricing: (pricing: PricingData) => void
  setLiveStream: (stream: LiveStreamData) => void
  setConnectionStatus: (connected: boolean) => void
  setRadarItems: (items: RadarItem[]) => void
  showAlertBanner: (title: string, subtitle: string) => void
  hideAlert: () => void
  updateSettings: (settings: Partial<Pick<AppState, "mispricingThreshold" | "minConfidence">>) => void
  
  // Betting actions
  setBets: (bets: Bet[]) => void
  addBet: (bet: Bet) => void
  updateBet: (betId: string, updates: Partial<Bet>) => void
  setBettingStats: (stats: BettingStats) => void
  setBettingDashboard: (dashboard: BettingDashboard) => void
  calculateBettingStats: () => BettingStats
  // Create bet from a radar line
  addBetFromRadar: (item: RadarItem) => Bet
  starLine: (propId: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isAuthenticated: false, // Start unauthenticated
  user: null,
  currentPricing: null,
  liveStream: null,
  isConnected: false,
  radarItems: [],
  showAlert: false,
  alertData: null,
  mispricingThreshold: 0.05,
  minConfidence: 0.6,
  bets: [],
  bettingStats: null,
  bettingDashboard: null,
  starredPropIds: [],

  // Actions
  login: async (email: string, password: string) => {
    // Mock authentication - in real app, this would call an API
    return new Promise((resolve) => {
      setTimeout(() => {
        set({
          isAuthenticated: true,
          user: {
            id: "1",
            email,
            name: email.split("@")[0],
          },
        })
        resolve()
      }, 1000)
    })
  },
  signup: async (email: string, password: string, name: string) => {
    // Mock authentication - in real app, this would call an API
    return new Promise((resolve) => {
      setTimeout(() => {
        set({
          isAuthenticated: true,
          user: {
            id: "1",
            email,
            name,
          },
        })
        resolve()
      }, 1000)
    })
  },
  logout: () => set({ isAuthenticated: false, user: null }),
  setCurrentPricing: (pricing) => set({ currentPricing: pricing }),
  setLiveStream: (stream) => set({ liveStream: stream }),
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  setRadarItems: (items) => set({ radarItems: items }),
  showAlertBanner: (title, subtitle) =>
    set({
      showAlert: true,
      alertData: { title, subtitle },
    }),
  hideAlert: () => set({ showAlert: false, alertData: null }),
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
  
  // Betting actions
  setBets: (bets) => set({ bets }),
  addBet: (bet) => set((state) => ({ bets: [...state.bets, bet] })),
  updateBet: (betId, updates) => set((state) => ({
    bets: state.bets.map(bet => bet.id === betId ? { ...bet, ...updates } : bet)
  })),
  setBettingStats: (stats) => set({ bettingStats: stats }),
  setBettingDashboard: (dashboard) => set({ bettingDashboard: dashboard }),
  calculateBettingStats: () => {
    const state = get()
    const bets = state.bets
    
    if (bets.length === 0) {
      return {
        totalBets: 0,
        totalStaked: 0,
        totalWon: 0,
        totalProfit: 0,
        winRate: 0,
        avgOdds: 0,
        avgStake: 0,
        bestWin: 0,
        worstLoss: 0,
        currentStreak: { type: 'win' as const, count: 0 },
        dailyStats: {
          today: { bets: 0, staked: 0, profit: 0 },
          thisWeek: { bets: 0, staked: 0, profit: 0 },
          thisMonth: { bets: 0, staked: 0, profit: 0 }
        }
      }
    }
    
    const settledBets = bets.filter(bet => bet.status === 'won' || bet.status === 'lost')
    const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0)
    const totalWon = settledBets.reduce((sum, bet) => sum + (bet.status === 'won' ? bet.potentialWin : 0), 0)
    const totalProfit = totalWon - totalStaked
    const winRate = settledBets.length > 0 ? (settledBets.filter(bet => bet.status === 'won').length / settledBets.length) * 100 : 0
    const avgOdds = bets.reduce((sum, bet) => sum + bet.odds, 0) / bets.length
    const avgStake = totalStaked / bets.length
    
    const wins = settledBets.filter(bet => bet.status === 'won').map(bet => bet.potentialWin - bet.stake)
    const losses = settledBets.filter(bet => bet.status === 'lost').map(bet => -bet.stake)
    const bestWin = wins.length > 0 ? Math.max(...wins) : 0
    const worstLoss = losses.length > 0 ? Math.min(...losses) : 0
    
    // Calculate current streak
    let currentStreak: { type: 'win' | 'loss', count: number } = { type: 'win', count: 0 }
    if (settledBets.length > 0) {
      const sortedBets = [...settledBets].sort((a, b) => new Date(b.settledAt || b.placedAt).getTime() - new Date(a.settledAt || a.placedAt).getTime())
      const lastResult = sortedBets[0].status
      let count = 1
      for (let i = 1; i < sortedBets.length; i++) {
        if (sortedBets[i].status === lastResult) {
          count++
        } else {
          break
        }
      }
      currentStreak = { type: lastResult === 'won' ? 'win' : 'loss', count }
    }
    
    // Calculate daily stats
    const today = new Date()
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const todayBets = bets.filter(bet => {
      const betDate = new Date(bet.placedAt)
      return betDate.toDateString() === today.toDateString()
    })
    
    const thisWeekBets = bets.filter(bet => new Date(bet.placedAt) >= startOfWeek)
    const thisMonthBets = bets.filter(bet => new Date(bet.placedAt) >= startOfMonth)
    
    const calculateDailyStats = (betList: Bet[]) => {
      const staked = betList.reduce((sum, bet) => sum + bet.stake, 0)
      const won = betList.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potentialWin, 0)
      return {
        bets: betList.length,
        staked,
        profit: won - staked
      }
    }
    
    return {
      totalBets: bets.length,
      totalStaked,
      totalWon,
      totalProfit,
      winRate,
      avgOdds,
      avgStake,
      bestWin,
      worstLoss,
      currentStreak,
      dailyStats: {
        today: calculateDailyStats(todayBets),
        thisWeek: calculateDailyStats(thisWeekBets),
        thisMonth: calculateDailyStats(thisMonthBets)
      }
    }
  },

  // Convert a RadarItem (stale line) into a pending Bet and add to Active Bets
  addBetFromRadar: (item) => {
    const state = get()

    // Parse propId: e.g., "PASS_YDS_over_275.5_beck"
    const parts = item.propId.split("_")
    const prop = (parts[0] || "PROP") as Bet["prop"]
    const betType = ((parts[1] || "over") as "over" | "under")
    const line = parseFloat(parts[2]) || 0
    const playerId = parts[3] || "player123"

    const nameMap: Record<string, string> = {
      beck: "Carson Beck",
      milroe: "Jalen Milroe",
      milton: "Kendall Milton",
      smith: "Arian Smith",
      williams: "Ryan Williams",
      haynes: "Justice Haynes",
      player123: "Carson Beck",
      player456: "Kendall Milton",
      player789: "Arian Smith",
    }

    const playerName = nameMap[playerId] || playerId.replace("player", "Player ")

    // If a matching real bet already exists, just star it and return it
    const existing = state.bets.find(b => b.prop === prop && b.betType === betType && b.line === line && b.player === playerName)
    if (existing) {
      set((s) => ({
        starredPropIds: s.starredPropIds.includes(item.propId)
          ? s.starredPropIds
          : [...s.starredPropIds, item.propId],
      }))
      return existing
    }

    const newBet: Bet = {
      id: `line_${Date.now()}`,
      prop,
      player: playerName,
      market: prop === "REC" ? "Receptions" : prop === "PASS_YDS" ? "Passing Yards" : prop === "RUSH_YDS" ? "Rushing Yards" : prop,
      line,
      betType,
      odds: 1.88,
      stake: 0,
      potentialWin: 0,
      status: "pending",
      placedAt: new Date().toISOString(),
      gameInfo: {
        homeTeam: "Georgia Bulldogs",
        awayTeam: "Alabama Crimson Tide",
        gameTime: "Today",
      },
    }

    set((state) => ({ 
      bets: [newBet, ...state.bets],
      starredPropIds: state.starredPropIds.includes(item.propId)
        ? state.starredPropIds
        : [...state.starredPropIds, item.propId]
    }))
    return newBet
  },
  starLine: (propId) => set((state) => ({
    starredPropIds: state.starredPropIds.includes(propId)
      ? state.starredPropIds
      : [...state.starredPropIds, propId]
  })),
}))
