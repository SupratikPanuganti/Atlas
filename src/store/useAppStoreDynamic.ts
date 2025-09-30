import { create } from "zustand"
import type { PricingData, LiveStreamData, RadarItem, Bet, BettingStats, BettingDashboard, H2HLine, H2HMatch, H2HUser, GeminiResponse } from "../types"
import { databaseService } from "../services/databaseService"
import { demoService } from "../services/demoData"

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

  // H2H data
  h2hLines: H2HLine[]
  h2hMatches: H2HMatch[]
  h2hUser: H2HUser | null
  userCredits: number

  // Loading states
  isLoading: boolean
  error: string | null

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
  addBetFromRadar: (item: RadarItem) => Bet
  starLine: (propId: string) => void

  // H2H actions
  setH2hLines: (lines: H2HLine[]) => void
  addH2hLine: (line: H2HLine) => void
  updateH2hLine: (lineId: string, updates: Partial<H2HLine>) => void
  matchH2hLine: (lineId: string, opponentId: string) => void
  settleH2hLine: (lineId: string, finalValue: number) => void
  setUserCredits: (credits: number) => void
  getGeminiAnalysis: (player: string, propType: string, customLine: number) => Promise<GeminiResponse>
  findMatchingOpponents: (line: H2HLine) => H2HLine[]

  // Database actions
  loadH2HLines: () => Promise<void>
  loadBets: () => Promise<void>
  loadLiveGames: () => Promise<void>
  loadPlayerStats: (gameId: string) => Promise<void>
  createH2HLine: (lineData: any) => Promise<void>
  takeOppositeSide: (lineId: string) => Promise<void>
}

export const useAppStoreDynamic = create<AppState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
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
  h2hLines: [],
  h2hMatches: [],
  h2hUser: null,
  userCredits: 1500,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // Mock authentication for now - in production, use Supabase Auth
      await new Promise(resolve => setTimeout(resolve, 1000))
      set({
        isAuthenticated: true,
        user: {
          id: "user123", // This would come from Supabase Auth
          email,
          name: email.split("@")[0],
        },
        isLoading: false
      })
    } catch (error) {
      set({ error: "Login failed", isLoading: false })
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null })
    try {
      // Mock authentication for now - in production, use Supabase Auth
      await new Promise(resolve => setTimeout(resolve, 1000))
      set({
        isAuthenticated: true,
        user: {
          id: "user123", // This would come from Supabase Auth
          email,
          name,
        },
        isLoading: false
      })
    } catch (error) {
      set({ error: "Signup failed", isLoading: false })
    }
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
    const { bets } = get()
    const totalBets = bets.length
    const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0)
    const totalWon = bets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.potentialWin, 0)
    const totalProfit = totalWon - totalStaked
    const winRate = totalBets > 0 ? (bets.filter(bet => bet.status === 'won').length / totalBets) * 100 : 0
    
    return {
      totalBets,
      totalStaked,
      totalWon,
      totalProfit,
      winRate,
      avgOdds: 1.9,
      avgStake: totalBets > 0 ? totalStaked / totalBets : 0,
      bestWin: Math.max(...bets.map(bet => bet.potentialWin), 0),
      worstLoss: Math.min(...bets.map(bet => -bet.stake), 0),
      currentStreak: { type: 'win' as const, count: 0 },
      dailyStats: {
        today: { bets: 0, staked: 0, profit: 0 },
        thisWeek: { bets: 0, staked: 0, profit: 0 },
        thisMonth: { bets: 0, staked: 0, profit: 0 }
      }
    }
  },

  addBetFromRadar: (item) => {
    const newBet: Bet = {
      id: `bet_${Date.now()}`,
      prop: item.propId.split('_')[0],
      player: item.label.split(' ')[0] + ' ' + item.label.split(' ')[1],
      market: item.propId.split('_')[0],
      line: parseFloat(item.propId.split('_')[2]),
      betType: item.propId.includes('over') ? 'over' : 'under',
      odds: 1.9,
      stake: 25,
      potentialWin: 47.5,
      status: 'pending',
      placedAt: new Date().toISOString(),
      gameInfo: {
        homeTeam: "Team A",
        awayTeam: "Team B",
        gameTime: "3:30 PM ET"
      }
    }
    get().addBet(newBet)
    return newBet
  },

  starLine: (propId) => set((state) => ({
    starredPropIds: state.starredPropIds.includes(propId)
      ? state.starredPropIds.filter(id => id !== propId)
      : [...state.starredPropIds, propId]
  })),

  // H2H actions
  setH2hLines: (lines) => set({ h2hLines: lines }),
  addH2hLine: (line) => set((state) => ({ h2hLines: [...state.h2hLines, line] })),
  updateH2hLine: (lineId, updates) => set((state) => ({
    h2hLines: state.h2hLines.map(line => line.id === lineId ? { ...line, ...updates } : line)
  })),

  matchH2hLine: async (lineId: string, opponentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = get()
      if (!user) throw new Error("User not authenticated")

      // Update the H2H line status to matched
      await databaseService.updateH2HLineStatus(lineId, 'matched', opponentId)
      
      // Create the match record
      const line = get().h2hLines.find(l => l.id === lineId)
      if (!line) throw new Error("Line not found")

      await databaseService.createH2HMatch({
        line_id: lineId,
        creator_id: line.creatorId,
        opponent_id: opponentId,
        creator_side: line.side,
        opponent_side: line.side === 'over' ? 'under' : 'over',
        stake_credits: line.stakeCredits
      })

      // Update local state
      get().updateH2hLine(lineId, { 
        status: 'matched', 
        matchedWith: opponentId,
        matchedAt: new Date().toISOString()
      })

      set({ isLoading: false })
    } catch (error) {
      set({ error: "Failed to match line", isLoading: false })
    }
  },

  settleH2hLine: async (lineId: string, finalValue: number) => {
    set({ isLoading: true, error: null })
    try {
      // Update the line status to settled
      await databaseService.updateH2HLineStatus(lineId, 'settled')
      
      // Update local state
      get().updateH2hLine(lineId, { status: 'settled' })
      
      set({ isLoading: false })
    } catch (error) {
      set({ error: "Failed to settle line", isLoading: false })
    }
  },

  setUserCredits: (credits) => set({ userCredits: credits }),

  getGeminiAnalysis: async (player: string, propType: string, customLine: number) => {
    // Mock Gemini analysis for now
    return {
      fairValue: customLine * 0.95,
      explanation: `Based on ${player}'s recent performance and matchup analysis, the fair value for ${propType} is ${customLine * 0.95}.`,
      confidence: 0.75,
      suggestedLine: customLine * 0.95,
      marketComparison: "This line is slightly above market consensus.",
      riskAssessment: "Medium risk due to game script uncertainty."
    }
  },

  findMatchingOpponents: (line) => {
    return get().h2hLines.filter(l => 
      l.id !== line.id && 
      l.player === line.player && 
      l.propType === line.propType &&
      l.status === 'open' &&
      l.side !== line.side
    )
  },

  // Database actions
  loadH2HLines: async () => {
    set({ isLoading: true, error: null })
    try {
      const dbLines = await databaseService.getH2HLines()
      const frontendLines = dbLines.map(dbLine => databaseService.convertDbH2HLineToFrontend(dbLine))
      set({ h2hLines: frontendLines, isLoading: false })
    } catch (error) {
      set({ error: "Failed to load H2H lines", isLoading: false })
    }
  },

  loadBets: async () => {
    set({ isLoading: true, error: null })
    try {
      const { user } = get()
      if (!user) {
        // Load demo bets if no user
        const demoBets = demoService.generateDemoBets()
        const demoStats = demoService.generateDemoBettingStats()
        set({ bets: demoBets, bettingStats: demoStats, isLoading: false })
        return
      }

      // Load real bets from database
      const dbMatches = await databaseService.getH2HMatches(user.id)
      const bets = dbMatches.map(match => databaseService.convertDbToBet(match, match.h2h_lines))
      const stats = get().calculateBettingStats()
      
      set({ bets, bettingStats: stats, isLoading: false })
    } catch (error) {
      set({ error: "Failed to load bets", isLoading: false })
    }
  },

  loadLiveGames: async () => {
    set({ isLoading: true, error: null })
    try {
      const games = await databaseService.getLiveGames()
      // Convert to radar items for display
      const radarItems: RadarItem[] = games.flatMap(game => [
        {
          propId: `LIVE_${game.home_team}_vs_${game.away_team}`,
          label: `${game.home_team} vs ${game.away_team}`,
          deltaVsMedian: 1.2,
          staleMin: 0,
          sport: "NFL" as const
        }
      ])
      set({ radarItems, isLoading: false })
    } catch (error) {
      set({ error: "Failed to load live games", isLoading: false })
    }
  },

  loadPlayerStats: async (gameId: string) => {
    set({ isLoading: true, error: null })
    try {
      const stats = await databaseService.getPlayerStats(gameId)
      // Update live stream data with real stats
      const liveStream: LiveStreamData = {
        t_sec: 2847,
        score_diff: 7,
        pace: 78.1,
        to_rate: 0.12,
        hot_hand: 0.82,
        starter_on: 1,
        market: stats.map(stat => ({
          prop: `${stat.players.name}_${stat.passing_yards || stat.rushing_yards || stat.receptions}`,
          line: stat.passing_yards || stat.rushing_yards || stat.receptions || 0,
          odds: 1.85,
          median_line: (stat.passing_yards || stat.rushing_yards || stat.receptions || 0) * 0.9,
          last_change_ts: Date.now()
        }))
      }
      set({ liveStream, isLoading: false })
    } catch (error) {
      set({ error: "Failed to load player stats", isLoading: false })
    }
  },

  createH2HLine: async (lineData: any) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = get()
      if (!user) throw new Error("User not authenticated")

      const newLine = await databaseService.createH2HLine({
        ...lineData,
        creator_id: user.id
      })

      const frontendLine = databaseService.convertDbH2HLineToFrontend(newLine)
      get().addH2hLine(frontendLine)
      
      set({ isLoading: false })
    } catch (error) {
      set({ error: "Failed to create H2H line", isLoading: false })
    }
  },

  takeOppositeSide: async (lineId: string) => {
    const { user } = get()
    if (!user) return

    await get().matchH2hLine(lineId, user.id)
  }
}))
