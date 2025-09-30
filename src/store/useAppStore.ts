import { create } from "zustand"
import type { PricingData, LiveStreamData, RadarItem, Bet, BettingStats, BettingDashboard, H2HLine, H2HMatch, H2HUser, GeminiResponse } from "../types"
import { authService } from "../services/authService"
import { bettingService } from "../services/bettingService"
import { bettingLinesService } from "../services/bettingLinesService"
import { databaseService } from "../services/databaseService"
import { startNCAAMockTriggers, stopNCAAMockTriggers } from "../services/ncaaMockTriggerService"

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

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<void>
  setCurrentPricing: (pricing: PricingData) => void
  setLiveStream: (stream: LiveStreamData) => void
  setConnectionStatus: (connected: boolean) => void
  setRadarItems: (items: RadarItem[]) => void
  loadRadarItems: (sport?: 'NCAA' | 'NFL', tab?: 'today' | 'suggestions', propTypes?: string[], deltaSign?: 'both' | 'positive' | 'negative') => Promise<void>
  refreshRadarItems: (sport?: 'NCAA' | 'NFL', tab?: 'today' | 'suggestions', propTypes?: string[], deltaSign?: 'both' | 'positive' | 'negative') => Promise<void>
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
  
  // Helper function to get prop display name
  getPropDisplayName: (propType: string) => string
  
  // Helper function to generate consistent propId from bet or radar item
  generatePropId: (data: { prop: string, betType: string, line: number, player: string }) => string
  
  // Dynamic betting actions
  loadUserBets: () => Promise<void>
  loadActiveBets: () => Promise<void>
  loadBetHistory: () => Promise<void>
  loadBettingStats: () => Promise<void>
  createUserBet: (betParams: import('../services/bettingService').CreateBetParams) => Promise<void>
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
  h2hLines: [],
  h2hMatches: [],
  h2hUser: null,
  userCredits: 1500,

  // Actions
  refreshRadarItems: async (sport?: 'NCAA' | 'NFL', tab?: 'today' | 'suggestions', propTypes?: string[], deltaSign?: 'both' | 'positive' | 'negative') => {
    try {
      // Use the same logic as loadRadarItems
      const bettingLines = await databaseService.getBettingLines()
      let radarItems: RadarItem[] = bettingLines.map(line => ({
        propId: `${line.prop_type}_${line.over_under}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`,
        label: `${line.player_name} ${line.prop_type} ${line.line} ${line.over_under}`,
        deltaVsMedian: parseFloat(line.delta),
        staleMin: Math.max(0, Math.floor((Date.now() - new Date(line.last_updated).getTime()) / (1000 * 60))),
        sport: line.sport as 'NCAA' | 'NFL',
        player: line.player_name,
        prop: line.prop_type,
        line: parseFloat(line.line),
        confidence: line.suggested ? 0.8 : 0.6,
        volume: Math.floor(Math.random() * 1000) + 100,
        // Include analysis and events data for LiveScreen
        analysis: line.analysis,
        events: line.events,
        player_name: line.player_name,
        prop_type: line.prop_type,
        over_under: line.over_under,
        bettingLineId: line.id
      }))
      
      if (sport) {
        radarItems = radarItems.filter(item => item.sport === sport)
      }
      
      // Filter by prop types
      if (propTypes && propTypes.length > 0) {
        radarItems = radarItems.filter(item => propTypes.includes(item.prop))
      }
      
      // Filter by delta sign (positive = >1, negative = <=1)
      if (deltaSign && deltaSign !== 'both') {
        if (deltaSign === 'positive') {
          radarItems = radarItems.filter(item => item.deltaVsMedian > 1)
        } else if (deltaSign === 'negative') {
          radarItems = radarItems.filter(item => item.deltaVsMedian <= 1)
        }
      }
      
      // For suggestions tab, show only top 3 based on delta (highest first), then most recent time
      if (tab === 'suggestions') {
        radarItems = radarItems
          .sort((a, b) => {
            // First sort by delta (highest first)
            if (b.deltaVsMedian !== a.deltaVsMedian) {
              return b.deltaVsMedian - a.deltaVsMedian
            }
            // If deltas are equal, sort by most recent time (lowest staleMin first)
            return a.staleMin - b.staleMin
          })
          .slice(0, 3) // Take only top 3
      }
      
      set({ radarItems })
    } catch (error) {
      console.error('Error refreshing radar items:', error)
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const { user: authUser } = await authService.signIn(email, password)
      
      if (!authUser) {
        throw new Error('Authentication failed')
      }

      // Get user profile from our users table
      const userProfile = await authService.getUserProfile(authUser.id)
      
      set({
        isAuthenticated: true,
        user: {
          id: authUser.id,
          email: authUser.email || email,
          name: userProfile?.username || email.split("@")[0],
        },
      })

      // Start NCAA mock triggers after successful login
      console.log('🏈 Starting NCAA mock triggers after login')
      startNCAAMockTriggers(get())

      // Load user's betting data after successful login
      try {
        await Promise.all([
          bettingService.getUserBets(authUser.id),
          bettingService.getBettingStats(authUser.id)
        ]).then(([bets, stats]) => {
          set({ bets, bettingStats: stats })
        })
      } catch (error) {
        console.error('Error loading user data after login:', error)
        // Don't fail login if betting data fails to load
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },
  signup: async (email: string, password: string, name: string) => {
    try {
      const { user: authUser } = await authService.signUp(email, name, password)
      
      if (!authUser) {
        throw new Error('Signup failed')
      }

      // Create user profile in our users table
      await authService.createUserProfile(authUser.id, email, name)
      
      set({
        isAuthenticated: true,
        user: {
          id: authUser.id,
          email: authUser.email || email,
          name,
        },
        bets: [], // Initialize with empty bets for new user
        bettingStats: null, // Initialize with null stats for new user
      })

      // Start NCAA mock triggers after successful signup
      console.log('🏈 Starting NCAA mock triggers after signup')
      startNCAAMockTriggers(get())
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  },
  logout: async () => {
    try {
      // Stop NCAA mock triggers before logout
      console.log('🏈 Stopping NCAA mock triggers before logout')
      stopNCAAMockTriggers()
      
      await authService.signOut()
      set({ isAuthenticated: false, user: null, bets: [], bettingStats: null })
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if logout fails
      stopNCAAMockTriggers()
      set({ isAuthenticated: false, user: null, bets: [], bettingStats: null })
    }
  },
  checkAuthStatus: async () => {
    try {
      const user = await authService.getCurrentUser()
      if (user) {
        const userProfile = await authService.getUserProfile(user.id)
        set({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email || '',
            name: userProfile?.username || user.email?.split("@")[0] || 'User',
          },
        })

        // Start NCAA mock triggers if user is already authenticated
        console.log('🏈 Starting NCAA mock triggers for existing auth')
        startNCAAMockTriggers(get())

        // Load user's betting data if user exists
        try {
          await Promise.all([
            bettingService.getUserBets(user.id),
            bettingService.getBettingStats(user.id)
          ]).then(([bets, stats]) => {
            set({ bets, bettingStats: stats })
          })
        } catch (error) {
          console.error('Error loading user data in checkAuthStatus:', error)
          // Initialize with empty data if loading fails
          set({ bets: [], bettingStats: null })
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error)
      set({ isAuthenticated: false, user: null })
    }
  },
  setCurrentPricing: (pricing) => set({ currentPricing: pricing }),
  setLiveStream: (stream) => set({ liveStream: stream }),
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  setRadarItems: (items) => set({ radarItems: items }),
  loadRadarItems: async (sport, tab = 'today', propTypes = [], deltaSign = 'both') => {
    try {
      console.log('useAppStore: Loading radar items for sport:', sport, 'tab:', tab, 'propTypes:', propTypes, 'deltaSign:', deltaSign)
      
      // Get betting lines directly from database
      const bettingLines = await databaseService.getBettingLines()
      console.log('useAppStore: Got', bettingLines.length, 'betting lines from database')
      
      // Convert to radar items and filter
      let radarItems: RadarItem[] = bettingLines.map(line => ({
        propId: `${line.prop_type}_${line.over_under}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`,
        label: `${line.player_name} ${line.prop_type} ${line.line} ${line.over_under}`,
        deltaVsMedian: parseFloat(line.delta),
        staleMin: Math.max(0, Math.floor((Date.now() - new Date(line.last_updated).getTime()) / (1000 * 60))),
        sport: line.sport as 'NCAA' | 'NFL',
        bettingLineId: line.id, // Include the actual betting line ID
        player: line.player_name,
        prop: line.prop_type,
        line: parseFloat(line.line),
        confidence: line.suggested ? 0.8 : 0.6,
        volume: Math.floor(Math.random() * 1000) + 100,
        // Include analysis and events data for LiveScreen
        analysis: line.analysis,
        events: line.events,
        player_name: line.player_name,
        prop_type: line.prop_type,
        over_under: line.over_under
      }))
      
      // Filter by sport
      if (sport) {
        radarItems = radarItems.filter(item => item.sport === sport)
      }
      
      // Filter by prop types
      if (propTypes && propTypes.length > 0) {
        radarItems = radarItems.filter(item => propTypes.includes(item.prop))
      }
      
      // Filter by delta sign (positive = >1, negative = <=1)
      if (deltaSign && deltaSign !== 'both') {
        if (deltaSign === 'positive') {
          radarItems = radarItems.filter(item => item.deltaVsMedian > 1)
        } else if (deltaSign === 'negative') {
          radarItems = radarItems.filter(item => item.deltaVsMedian <= 1)
        }
      }
      
      // For suggestions tab, show only top 3 based on delta (highest first), then most recent time
      if (tab === 'suggestions') {
        radarItems = radarItems
          .sort((a, b) => {
            // First sort by delta (highest first)
            if (b.deltaVsMedian !== a.deltaVsMedian) {
              return b.deltaVsMedian - a.deltaVsMedian
            }
            // If deltas are equal, sort by most recent time (lowest staleMin first)
            return a.staleMin - b.staleMin
          })
          .slice(0, 3) // Take only top 3
      }
      
      console.log('useAppStore: Got', radarItems.length, 'radar items after filtering')
      set({ radarItems })
      
    } catch (error) {
      console.error('Error loading radar items:', error)
      // Keep existing radar items on error
    }
  },
  showAlertBanner: (title, subtitle) =>
    set({
      showAlert: true,
      alertData: { title, subtitle },
    }),
  hideAlert: () => set({ showAlert: false, alertData: null }),
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
  
  // Betting actions
  setBets: (bets) => {
    console.log('useAppStore: Setting bets, count:', bets.length)
    set({ bets })
  },
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

    // Use the actual data from the radar item instead of parsing propId
    const prop = item.prop.toUpperCase() as Bet["prop"]
    const betType = item.label.includes("over") ? "over" : "under"
    const line = item.line
    const playerName = item.player

    // If a matching real bet already exists, just star it and return it
    const existing = state.bets.find(b => 
      b.prop === prop && 
      b.betType === betType && 
      b.line === line && 
      b.player === playerName
    )
    if (existing) {
      set((s) => ({
        starredPropIds: s.starredPropIds.includes(item.propId)
          ? s.starredPropIds
          : [...s.starredPropIds, item.propId],
      }))
      return existing
    }

    // Create a proper bet with realistic data
    const stake = 50 // Default stake
    const odds = 1.85 // Default odds
    const potentialWin = stake * odds

    const newBet: Bet = {
      id: `mock_bet_${Date.now()}`,
      prop,
      player: playerName,
      market: getPropDisplayName(item.prop),
      line,
      betType,
      odds,
      stake,
      potentialWin,
      status: "pending",
      placedAt: new Date().toISOString(),
      gameInfo: {
        homeTeam: item.sport === "NCAA" ? "Georgia Tech" : "Kansas City",
        awayTeam: item.sport === "NCAA" ? "Wake Forest" : "Denver",
        gameTime: "8:00 PM EST",
        currentScore: item.sport === "NCAA" ? "Georgia Tech 21 - Wake Forest 14" : "Kansas City 28 - Denver 17",
      },
    }

    set((state) => ({ 
      bets: [newBet, ...state.bets],
      starredPropIds: state.starredPropIds.includes(item.propId)
        ? state.starredPropIds
        : [...state.starredPropIds, item.propId]
    }))
    
    console.log('useAppStore: Created new bet from radar item:', newBet)
    console.log('useAppStore: Total bets after adding:', get().bets.length)
    
    return newBet
  },

  // Helper function to get prop display name
  getPropDisplayName: (propType: string): string => {
    const propNames: Record<string, string> = {
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards',
      'receptions': 'Receptions',
      'passing_tds': 'Passing Touchdowns',
      'rushing_tds': 'Rushing Touchdowns',
      'receiving_tds': 'Receiving Touchdowns',
      'pass_yards': 'Passing Yards',
      'rush_yards': 'Rushing Yards',
      'rec_yards': 'Receiving Yards',
      'pass_tds': 'Passing Touchdowns',
      'rush_tds': 'Rushing Touchdowns',
      'rec_tds': 'Receiving Touchdowns',
      'pass_completions': 'Pass Completions',
      'rush_attempts': 'Rush Attempts',
      'interceptions': 'Interceptions',
      'total_tds': 'Total Touchdowns'
    }
    return propNames[propType] || propType
  },
  
  generatePropId: (data) => {
    const playerName = data.player.toLowerCase().replace(/\s+/g, '_')
    const propType = data.prop.toLowerCase()
    const betType = data.betType
    return `${propType}_${betType}_${data.line}_${playerName}`
  },
  
  starLine: (propId) => set((state) => ({
    starredPropIds: state.starredPropIds.includes(propId)
      ? state.starredPropIds.filter(id => id !== propId) // Remove if already starred (unfavorite)
      : [...state.starredPropIds, propId] // Add if not starred (favorite)
  })),

  // H2H actions
  setH2hLines: (lines) => set({ h2hLines: lines }),
  
  addH2hLine: (line) => set((state) => ({ 
    h2hLines: [line, ...state.h2hLines],
    userCredits: state.userCredits - line.stakeCredits
  })),
  
  updateH2hLine: (lineId, updates) => set((state) => ({
    h2hLines: state.h2hLines.map(line => 
      line.id === lineId ? { ...line, ...updates } : line
    )
  })),
  
  matchH2hLine: (lineId, opponentId) => {
    const state = get()
    const line = state.h2hLines.find(l => l.id === lineId)
    if (!line || line.status !== 'open') return

    const matchId = `match_${Date.now()}`
    const match: H2HMatch = {
      id: matchId,
      lineId,
      creatorId: line.creatorId,
      opponentId,
      creatorSide: line.side,
      opponentSide: line.side === 'over' ? 'under' : 'over',
      stakeCredits: line.stakeCredits,
      status: 'matched',
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      h2hLines: state.h2hLines.map(l => 
        l.id === lineId 
          ? { 
              ...l, 
              status: 'matched' as const,
              matchedWith: opponentId,
              matchedAt: new Date().toISOString()
            }
          : l
      ),
      h2hMatches: [...state.h2hMatches, match],
      userCredits: state.userCredits - line.stakeCredits // Opponent stakes credits
    }))
  },
  
  settleH2hLine: (lineId, finalValue) => {
    const state = get()
    const line = state.h2hLines.find(l => l.id === lineId)
    const match = state.h2hMatches.find(m => m.lineId === lineId)
    
    if (!line || !match || line.status !== 'live') return

    // Determine winner based on line and final value
    const lineHit = line.side === 'over' ? finalValue > line.customLine : finalValue < line.customLine
    const winner = lineHit ? 'creator' : 'opponent'
    const winnerIsCurrentUser = (winner === 'creator' && line.creatorId === state.user?.id) || 
                               (winner === 'opponent' && match.opponentId === state.user?.id)

    const winnings = winnerIsCurrentUser ? line.stakeCredits * 2 : 0

    set((state) => ({
      h2hLines: state.h2hLines.map(l => 
        l.id === lineId 
          ? { 
              ...l, 
              status: 'settled' as const,
              result: {
                finalValue,
                winner,
                settledAt: new Date().toISOString(),
                geminiRecap: `Final result: ${finalValue}. ${winner === 'creator' ? 'Line creator' : 'Opponent'} wins!`
              }
            }
          : l
      ),
      h2hMatches: state.h2hMatches.map(m =>
        m.lineId === lineId
          ? { ...m, status: 'settled' as const, winner, settledAt: new Date().toISOString() }
          : m
      ),
      userCredits: state.userCredits + winnings
    }))
  },
  
  setUserCredits: (credits) => set({ userCredits: credits }),
  
  getGeminiAnalysis: async (player, propType, customLine) => {
    // Simulate Gemini API call
    return new Promise<GeminiResponse>((resolve) => {
      setTimeout(() => {
        const fairValue = customLine - (Math.random() * 3 - 1.5) // Random fair value around custom line
        const confidence = 0.7 + Math.random() * 0.25 // Random confidence 70-95%
        
        resolve({
          fairValue: parseFloat(fairValue.toFixed(1)),
          explanation: `Based on ${player}'s recent performance and matchup analysis, fair value for ${propType} is around ${fairValue.toFixed(1)}`,
          confidence: parseFloat(confidence.toFixed(2)),
          suggestedLine: parseFloat((customLine - 0.5).toFixed(1)),
          marketComparison: customLine > fairValue ? 'Your line is above fair value' : 'Your line is below fair value',
          riskAssessment: customLine > fairValue + 1 ? 'High risk - consider lowering line' : 'Moderate risk - good value'
        })
      }, 1000 + Math.random() * 1000) // 1-2 second delay
    })
  },
  
  findMatchingOpponents: (line) => {
    const state = get()
    // Find opposite side lines for the same game/player/prop
    return state.h2hLines.filter(l => 
      l.id !== line.id &&
      l.status === 'open' &&
      l.game.gameId === line.game.gameId &&
      l.player === line.player &&
      l.propType === line.propType &&
      l.side !== line.side &&
      Math.abs(l.customLine - line.customLine) <= 1.0 // Within 1 point
    )
  },

  // Dynamic betting actions
  loadUserBets: async () => {
    const { user } = get()
    if (!user) return

    try {
      const bets = await bettingService.getUserBets(user.id)
      set({ bets })
      
      // Update starred state based on favorited bets
      const favoritedBets = bets.filter(bet => bet.is_favorited === true)
      const starredPropIds = favoritedBets.map(bet => {
        return get().generatePropId({
          prop: bet.prop,
          betType: bet.betType,
          line: bet.line,
          player: bet.player
        })
      })
      
      set({ starredPropIds })
      console.log('Updated starred state based on favorited bets:', starredPropIds)
    } catch (error) {
      console.error('Error loading user bets:', error)
    }
  },

  loadActiveBets: async () => {
    const { user } = get()
    if (!user) return

    try {
      const activeBets = await bettingService.getActiveBets(user.id)
      const { bets } = get()
      // Keep settled bets that are still favorited, plus the new active bets
      const settledBets = bets.filter(bet => 
        (bet.status === 'won' || bet.status === 'lost') && 
        bet.is_favorited !== false
      )
      const allBets = [...activeBets, ...settledBets]
      set({ bets: allBets })
      
      // Update starred state based on all favorited bets
      const favoritedBets = allBets.filter(bet => bet.is_favorited === true)
      const starredPropIds = favoritedBets.map(bet => {
        return get().generatePropId({
          prop: bet.prop,
          betType: bet.betType,
          line: bet.line,
          player: bet.player
        })
      })
      
      set({ starredPropIds })
      console.log('Updated starred state based on active bets:', starredPropIds)
    } catch (error) {
      console.error('Error loading active bets:', error)
    }
  },

  loadBetHistory: async () => {
    const { user } = get()
    if (!user) return

    try {
      const betHistory = await bettingService.getBetHistory(user.id)
      const { bets } = get()
      const activeBets = bets.filter(bet => bet.status === 'live' || bet.status === 'pending')
      set({ bets: [...activeBets, ...betHistory] })
    } catch (error) {
      console.error('Error loading bet history:', error)
    }
  },

  loadBettingStats: async () => {
    const { user } = get()
    if (!user) return

    try {
      const stats = await bettingService.getBettingStats(user.id)
      set({ bettingStats: stats })
    } catch (error) {
      console.error('Error loading betting stats:', error)
    }
  },

  createUserBet: async (betParams: import('../services/bettingService').CreateBetParams) => {
    const { user } = get()
    if (!user) throw new Error('User not authenticated')

    try {
      const newBet = await bettingService.createBet(user.id, betParams)
      const { bets } = get()
      set({ bets: [newBet, ...bets] })
    } catch (error) {
      console.error('Error creating bet:', error)
      throw error
    }
  }
}))
