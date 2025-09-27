import type { Bet, BettingStats, BettingDashboard } from "../types"

export const demoService = {
  // Simulate WebSocket connection
  connectToDemo: () => {
    console.log("Connected to demo stream")
    return {
      disconnect: () => console.log("Disconnected from demo stream"),
    }
  },

  // Generate demo pricing data for different scenarios
  generateDemoPricing: (scenario: 'assists' | 'points' | 'rebounds' = 'assists') => {
    const scenarios = {
      assists: {
        prop: "AST_over_7.5_player123",
        p_fair: 0.68,
        fair_price: 0.558,
        market_price: 0.45,
        mispricing: 0.108,
        ev_per_1: 0.238,
        fair_odds: 1.47,
        band: { lo: 0.52, hi: 0.59 },
        theta_per_30s: -0.01,
        drivers: [
          { 
            name: "pace" as const, 
            impact: 0.07,
            explanation: "Game pace has accelerated to 103.2 possessions/game (4% above season average). Higher pace = more possessions = more assist opportunities as the team pushes the ball in transition.",
            details: "Current pace: 103.2 vs Season avg: 99.1. Last 5 minutes pace: 108.3 (spike detected)"
          },
          { 
            name: "minutes" as const, 
            impact: 0.05,
            explanation: "Player is logging 2.3 more minutes than projected due to favorable matchup and hot hand. More minutes = more opportunities to accumulate assists.",
            details: "Projected: 28.2 min, Actual: 30.5 min. Usage rate up 8% in Q4 due to opponent's weak perimeter defense."
          },
          { 
            name: "turnovers" as const, 
            impact: 0.03,
            explanation: "Recent surge in live-ball turnovers (3 in last 90 seconds) creates fast-break opportunities where assists are more likely to occur.",
            details: "TO rate: 18% (season avg: 14%). Fast-break assists account for 23% of total assists this game vs 15% season average."
          },
          { 
            name: "teammate_efficiency" as const, 
            impact: 0.02,
            explanation: "Shooting efficiency of primary targets is 12% above season average, meaning passes are more likely to result in made baskets.",
            details: "FG% on passes from this player: 58.3% vs 46.1% season average. Hot shooting streak in Q4."
          },
          { 
            name: "defensive_pressure" as const, 
            impact: -0.01,
            explanation: "Opponent has tightened perimeter defense, making assist passes slightly more difficult to execute.",
            details: "Defensive pressure rating: 7.2/10 (season avg: 5.8). Contested pass rate up 15% in last 4 minutes."
          }
        ],
      },
      points: {
        prop: "PTS_over_25.5_player456",
        p_fair: 0.72,
        fair_price: 0.611,
        market_price: 0.52,
        mispricing: 0.091,
        ev_per_1: 0.191,
        fair_odds: 1.39,
        band: { lo: 0.58, hi: 0.64 },
        theta_per_30s: 0.02,
        drivers: [
          { 
            name: "pace" as const, 
            impact: 0.08,
            explanation: "Up-tempo game creates more scoring opportunities. Current pace of 106.1 possessions is 7% above season average, directly increasing shot volume.",
            details: "Pace: 106.1 vs 99.1 avg. Shot attempts per game: 18.3 vs 17.1 projected."
          },
          { 
            name: "minutes" as const, 
            impact: 0.06,
            explanation: "Player is seeing extended run due to hot shooting (67% FG in Q3). Coach riding the hot hand with 3.2 extra minutes vs projection.",
            details: "Actual: 32.1 min vs 28.9 projected. Usage rate: 28.3% (season: 24.1%)"
          },
          { 
            name: "usage" as const, 
            impact: 0.04,
            explanation: "Offensive load increased due to teammate foul trouble. Player taking 4.2 more shots per 36 minutes than season average.",
            details: "FGA/36: 19.1 vs 14.9 season avg. Touch rate: 42.3% vs 35.8% baseline."
          },
          { 
            name: "teammate_efficiency" as const, 
            impact: 0.03,
            explanation: "Excellent ball movement creating open looks. Assist rate up 23% leading to higher-quality shot attempts.",
            details: "Open shot rate: 68% vs 54% season avg. Catch-and-shoot 3P%: 41.2% vs 35.8%"
          },
          { 
            name: "hot_hand" as const, 
            impact: 0.02,
            explanation: "Player is in a shooting rhythm with 67% FG over last 8 minutes. Hot hand effect increases confidence and shot selection.",
            details: "Last 8 min: 67% FG vs 45% season avg. 3P streak: 4/5 in Q3. Shot quality rating: 8.3/10"
          }
        ],
      },
      rebounds: {
        prop: "REB_over_10.5_player789",
        p_fair: 0.61,
        fair_price: 0.492,
        market_price: 0.58,
        mispricing: -0.088,
        ev_per_1: -0.168,
        fair_odds: 1.64,
        band: { lo: 0.46, hi: 0.52 },
        theta_per_30s: -0.005,
        drivers: [
          { 
            name: "pace" as const, 
            impact: 0.05,
            explanation: "Slower pace (94.2 possessions) means fewer missed shots and rebound opportunities. Pace down 5% from season average.",
            details: "Current pace: 94.2 vs 99.1 avg. FG attempts down 8.3% vs projected."
          },
          { 
            name: "minutes" as const, 
            impact: -0.02,
            explanation: "Player seeing reduced minutes due to foul trouble and opponent going small-ball. 2.8 minutes below projection.",
            details: "Actual: 25.3 min vs 28.1 projected. Foul rate: 6.8/36 min vs 4.2 season avg."
          },
          { 
            name: "teammate_efficiency" as const, 
            impact: -0.03,
            explanation: "Team shooting 58.3% FG (well above 46.1% season avg), meaning fewer rebound opportunities from missed shots.",
            details: "Team FG%: 58.3% vs 46.1% avg. Missed shots down 22% vs typical game."
          },
          { 
            name: "defensive_pressure" as const, 
            impact: -0.01,
            explanation: "Opponent playing small-ball lineup, reducing traditional rebounding opportunities and forcing player to perimeter.",
            details: "Opponent average height: 6'5\" vs 6'8\" typical. Perimeter touches up 34%."
          },
          { 
            name: "foul_trouble" as const, 
            impact: -0.02,
            explanation: "Player in foul trouble (4 fouls) limiting aggressive rebounding and forcing conservative positioning.",
            details: "Foul rate: 6.8/36 min vs 4.2 season avg. Defensive rebounding down 23% due to foul concerns."
          },
          { 
            name: "game_script" as const, 
            impact: -0.01,
            explanation: "Blowout game script (team up 18) reducing competitive intensity and rebounding effort.",
            details: "Score differential: +18 points. Rebounding intensity rating: 6.2/10 vs 8.4 season avg."
          }
        ],
      }
    }
    
    return scenarios[scenario]
  },

  // Generate demo live stream data
  generateDemoStream: () => ({
    t_sec: 494,
    score_diff: -3,
    pace: 103.2,
    to_rate: 0.18,
    hot_hand: 0.76,
    starter_on: 1,
    market: [
      {
        prop: "AST_over_7.5",
        line: 7.5,
        odds: 1.82,
        median_line: 7.0,
        last_change_ts: 480,
      },
    ],
  }),

  // Generate demo radar items
  generateDemoRadar: () => [
    {
      prop: "PRA_over_42.5_player1",
      delta_vs_median: 1.5,
      stale_min: 4,
      label: "Player X PRA 42.5 o",
    },
    {
      prop: "AST_over_7.5_player2",
      delta_vs_median: 1.0,
      stale_min: 3,
      label: "Player Y AST 7.5 o",
    },
  ],

  // Generate demo betting data
  generateDemoBets: (): Bet[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    return [
      // Active bets for today
      {
        id: "bet_1",
        prop: "PRA",
        player: "Nikola Jokic",
        market: "Points + Rebounds + Assists",
        line: 42.5,
        betType: "over",
        odds: 1.85,
        stake: 25,
        potentialWin: 46.25,
        status: "live",
        placedAt: today.toISOString(),
        gameInfo: {
          homeTeam: "Denver Nuggets",
          awayTeam: "Los Angeles Lakers",
          gameTime: "8:00 PM ET",
          currentScore: "DEN 98 - LAL 94",
          quarter: "Q4",
          timeRemaining: "3:42"
        },
        currentValue: 32.50,
        liveStats: {
          current: 38,
          projected: 43.2,
          confidence: 0.78
        }
      },
      {
        id: "bet_2",
        prop: "AST",
        player: "LeBron James",
        market: "Assists",
        line: 7.5,
        betType: "under",
        odds: 1.95,
        stake: 20,
        potentialWin: 39.00,
        status: "live",
        placedAt: today.toISOString(),
        gameInfo: {
          homeTeam: "Denver Nuggets",
          awayTeam: "Los Angeles Lakers",
          gameTime: "8:00 PM ET",
          currentScore: "DEN 98 - LAL 94",
          quarter: "Q4",
          timeRemaining: "3:42"
        },
        currentValue: 18.50,
        liveStats: {
          current: 6,
          projected: 7.1,
          confidence: 0.82
        }
      },
      {
        id: "bet_3",
        prop: "PTS",
        player: "Stephen Curry",
        market: "Points",
        line: 25.5,
        betType: "over",
        odds: 1.90,
        stake: 30,
        potentialWin: 57.00,
        status: "pending",
        placedAt: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Golden State Warriors",
          awayTeam: "Phoenix Suns",
          gameTime: "10:30 PM ET",
          currentScore: undefined,
          quarter: undefined,
          timeRemaining: undefined
        }
      },
      // Yesterday's settled bets
      {
        id: "bet_4",
        prop: "REB",
        player: "Anthony Davis",
        market: "Rebounds",
        line: 12.5,
        betType: "over",
        odds: 1.88,
        stake: 25,
        potentialWin: 47.00,
        status: "won",
        placedAt: yesterday.toISOString(),
        settledAt: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Los Angeles Lakers",
          awayTeam: "Sacramento Kings",
          gameTime: "10:00 PM ET",
          currentScore: "LAL 112 - SAC 108"
        }
      },
      {
        id: "bet_5",
        prop: "3PM",
        player: "Klay Thompson",
        market: "3-Pointers Made",
        line: 3.5,
        betType: "under",
        odds: 1.92,
        stake: 20,
        potentialWin: 38.40,
        status: "lost",
        placedAt: yesterday.toISOString(),
        settledAt: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Golden State Warriors",
          awayTeam: "Portland Trail Blazers",
          gameTime: "10:30 PM ET",
          currentScore: "GSW 125 - POR 119"
        }
      },
      // Older bets
      {
        id: "bet_6",
        prop: "AST",
        player: "Luka Doncic",
        market: "Assists",
        line: 8.5,
        betType: "over",
        odds: 1.83,
        stake: 35,
        potentialWin: 64.05,
        status: "won",
        placedAt: twoDaysAgo.toISOString(),
        settledAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Dallas Mavericks",
          awayTeam: "Houston Rockets",
          gameTime: "8:30 PM ET",
          currentScore: "DAL 118 - HOU 110"
        }
      },
      {
        id: "bet_7",
        prop: "PTS",
        player: "Giannis Antetokounmpo",
        market: "Points",
        line: 30.5,
        betType: "under",
        odds: 1.89,
        stake: 40,
        potentialWin: 75.60,
        status: "won",
        placedAt: twoDaysAgo.toISOString(),
        settledAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Milwaukee Bucks",
          awayTeam: "Miami Heat",
          gameTime: "8:00 PM ET",
          currentScore: "MIL 105 - MIA 98"
        }
      },
      {
        id: "bet_8",
        prop: "REB",
        player: "Joel Embiid",
        market: "Rebounds",
        line: 10.5,
        betType: "over",
        odds: 1.85,
        stake: 30,
        potentialWin: 55.50,
        status: "lost",
        placedAt: weekAgo.toISOString(),
        settledAt: new Date(weekAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Philadelphia 76ers",
          awayTeam: "Boston Celtics",
          gameTime: "7:30 PM ET",
          currentScore: "PHI 102 - BOS 108"
        }
      }
    ]
  },

  // Generate demo betting stats
  generateDemoBettingStats: (): BettingStats => ({
    totalBets: 8,
    totalStaked: 225,
    totalWon: 152.45,
    totalProfit: -72.55,
    winRate: 50,
    avgOdds: 1.89,
    avgStake: 28.13,
    bestWin: 29.05,
    worstLoss: -35,
    currentStreak: {
      type: "loss",
      count: 1
    },
    dailyStats: {
      today: {
        bets: 3,
        staked: 75,
        profit: 0
      },
      thisWeek: {
        bets: 6,
        staked: 175,
        profit: -47.55
      },
      thisMonth: {
        bets: 8,
        staked: 225,
        profit: -72.55
      }
    }
  })
}
