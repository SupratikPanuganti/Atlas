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
  generateDemoPricing: (scenario: 'passing_yards' | 'rushing_yards' | 'receptions' = 'passing_yards') => {
    const scenarios = {
      passing_yards: {
        prop: "PASS_YDS_over_275.5_player123",
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
            explanation: "Georgia's tempo has increased to 75.2 plays/game (6% above season average). Higher tempo = more passing opportunities in this high-stakes SEC matchup.",
            details: "Current pace: 75.2 vs Season avg: 71.1. Last 2 drives: 82.1 plays/60min (uptempo detected)"
          },
          { 
            name: "minutes" as const, 
            impact: 0.05,
            explanation: "QB seeing extended drives due to Alabama's aggressive pass rush forcing quick reads. More snaps = more passing opportunities.",
            details: "Projected: 68 snaps, Actual: 72 snaps. Pass rate up 12% in 2nd half due to trailing by 7."
          },
          { 
            name: "turnovers" as const, 
            impact: 0.03,
            explanation: "Alabama's recent fumble (recovered by Georgia) creates short field situation where passing attack can be more aggressive.",
            details: "TO margin: +1 Georgia. Field position avg: 38-yard line vs 32-yard typical. Red zone opportunities up 18%."
          },
          { 
            name: "teammate_efficiency" as const, 
            impact: 0.02,
            explanation: "Georgia's receivers have 89% catch rate on targets (season avg: 74%), creating confidence for QB to attempt more passes.",
            details: "Completion %: 68.2% vs 61.4% season avg. YAC averaging 5.8 yards vs 4.2 typical."
          },
          { 
            name: "defensive_pressure" as const, 
            impact: -0.01,
            explanation: "Alabama's pass rush has generated pressure on 28% of dropbacks, slightly limiting downfield opportunities.",
            details: "Pressure rate: 28% vs 24% season avg. Quick game (≤2.5s) up 22% to combat rush."
          }
        ],
      },
      rushing_yards: {
        prop: "RUSH_YDS_over_125.5_player456",
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
            explanation: "Fast-paced SEC game with 78.1 plays/game creates more rushing opportunities. Game script favoring ground game with Georgia leading.",
            details: "Pace: 78.1 vs 71.1 avg. Rush attempts: 32 vs 28 projected. Time of possession: 18:42 (2nd half)"
          },
          { 
            name: "minutes" as const, 
            impact: 0.06,
            explanation: "RB seeing increased carries due to effective ground game (5.8 YPC). Coach leaning on run game with 8 extra carries vs projection.",
            details: "Actual: 23 carries vs 15 projected. Snap share: 76% (season: 58%). Goal line touches: 4 vs 2 avg"
          },
          { 
            name: "usage" as const, 
            impact: 0.04,
            explanation: "Offensive load shifted to ground game due to Alabama's strong pass coverage. RB getting 43% of total touches vs 31% season avg.",
            details: "Touches/drive: 2.8 vs 1.9 season avg. Red zone carries: 75% vs 45% typical."
          },
          { 
            name: "teammate_efficiency" as const, 
            impact: 0.03,
            explanation: "O-line creating excellent running lanes with 85% positive rush rate. Blocking efficiency up 18% vs season average.",
            details: "Yards before contact: 4.2 vs 2.8 avg. Missed tackles forced: 6 vs 3.1 season avg."
          },
          { 
            name: "hot_hand" as const, 
            impact: 0.02,
            explanation: "RB in rhythm with 6.8 YPC over last 3 drives. Hot hand effect and defensive fatigue increasing efficiency.",
            details: "Last 3 drives: 6.8 YPC vs 4.2 season avg. 4 runs of 10+ yards in 2nd half. Juke rate: 67%"
          }
        ],
      },
      receptions: {
        prop: "REC_over_6.5_player789",
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
            explanation: "Higher pace (78.1 plays) creates more passing opportunities for slot receivers. Tempo up 9% from season average favors underneath routes.",
            details: "Current pace: 78.1 vs 71.1 avg. Pass attempts up 12.3% vs projected. Slot targets: 8 vs 5.2 typical."
          },
          { 
            name: "minutes" as const, 
            impact: -0.02,
            explanation: "WR seeing reduced snaps due to Georgia's heavy 2-TE sets and Alabama's aggressive run defense. 8 fewer snaps than projected.",
            details: "Actual: 52 snaps vs 60 projected. 2-WR sets: 42% vs 65% season avg. 12 personnel usage up 28%."
          },
          { 
            name: "teammate_efficiency" as const, 
            impact: -0.03,
            explanation: "Running game averaging 6.2 YPC (well above 4.1 season avg), meaning fewer passing downs and reception opportunities.",
            details: "Rush success rate: 72% vs 58% avg. 3rd down conversion via run: 67% vs 31% typical."
          },
          { 
            name: "defensive_pressure" as const, 
            impact: -0.01,
            explanation: "Alabama's coverage focusing on underneath routes, limiting this WR's primary target area and forcing deeper routes.",
            details: "Slot coverage: 2-high safety 78% vs 52% typical. Targets ≤10 yards: 3 vs 7.2 season avg."
          },
          { 
            name: "matchup" as const, 
            impact: -0.02,
            explanation: "Facing Alabama's top slot corner who has allowed only 4.1 receptions/game to similar receivers this season.",
            details: "Matchup rating: 3.2/10. Opponent slot coverage: 67% completion allowed vs 78% WR season avg."
          },
          { 
            name: "game_script" as const, 
            impact: -0.01,
            explanation: "Georgia's ground-control game script (leading 14-7) reducing pass volume and reception opportunities in 2nd half.",
            details: "2nd half pass rate: 38% vs 58% 1st half. Clock management mode reducing total plays."
          }
        ],
      }
    }
    
    return scenarios[scenario]
  },

  // Generate demo live stream data
  generateDemoStream: () => ({
    t_sec: 2847, // 3rd Quarter, 7:27 remaining
    score_diff: 7, // Georgia leading 21-14
    pace: 78.1,
    to_rate: 0.12,
    hot_hand: 0.82,
    starter_on: 1,
    market: [
      {
        prop: "PASS_YDS_over_275.5",
        line: 275.5,
        odds: 1.82,
        median_line: 265.0,
        last_change_ts: 2820,
      },
    ],
  }),

  // Generate demo radar items
  generateDemoRadar: () => [
    {
      prop: "RUSH_YDS_over_125.5_player1",
      delta_vs_median: 1.5,
      stale_min: 4,
      label: "Georgia RB Rush Yds 125.5 o",
    },
    {
      prop: "PASS_YDS_over_275.5_player2",
      delta_vs_median: 1.0,
      stale_min: 3,
      label: "Alabama QB Pass Yds 275.5 o",
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
        prop: "RUSH_YDS",
        player: "Kendall Milton",
        market: "Rushing Yards",
        line: 125.5,
        betType: "over",
        odds: 1.85,
        stake: 25,
        potentialWin: 46.25,
        status: "live",
        placedAt: today.toISOString(),
        gameInfo: {
          homeTeam: "Georgia Bulldogs",
          awayTeam: "Alabama Crimson Tide",
          gameTime: "3:30 PM ET",
          currentScore: "UGA 21 - ALA 14",
          quarter: "Q3",
          timeRemaining: "7:27"
        },
        currentValue: 32.50,
        liveStats: {
          current: 94,
          projected: 132.8,
          confidence: 0.78
        }
      },
      {
        id: "bet_2",
        prop: "PASS_YDS",
        player: "Jalen Milroe",
        market: "Passing Yards",
        line: 275.5,
        betType: "under",
        odds: 1.95,
        stake: 20,
        potentialWin: 39.00,
        status: "live",
        placedAt: today.toISOString(),
        gameInfo: {
          homeTeam: "Georgia Bulldogs",
          awayTeam: "Alabama Crimson Tide",
          gameTime: "3:30 PM ET",
          currentScore: "UGA 21 - ALA 14",
          quarter: "Q3",
          timeRemaining: "7:27"
        },
        currentValue: 18.50,
        liveStats: {
          current: 198,
          projected: 267.3,
          confidence: 0.82
        }
      },
      {
        id: "bet_3",
        prop: "REC",
        player: "Arian Smith",
        market: "Receptions",
        line: 4.5,
        betType: "over",
        odds: 1.90,
        stake: 30,
        potentialWin: 57.00,
        status: "pending",
        placedAt: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Georgia Bulldogs",
          awayTeam: "Alabama Crimson Tide",
          gameTime: "3:30 PM ET",
          currentScore: undefined,
          quarter: undefined,
          timeRemaining: undefined
        }
      },
      // Yesterday's settled bets
      {
        id: "bet_4",
        prop: "RUSH_YDS",
        player: "Justice Haynes",
        market: "Rushing Yards",
        line: 85.5,
        betType: "over",
        odds: 1.88,
        stake: 25,
        potentialWin: 47.00,
        status: "won",
        placedAt: yesterday.toISOString(),
        settledAt: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Georgia Bulldogs",
          awayTeam: "Auburn Tigers",
          gameTime: "7:00 PM ET",
          currentScore: "UGA 31 - AUB 13"
        }
      },
      {
        id: "bet_5",
        prop: "PASS_TD",
        player: "Carson Beck",
        market: "Passing Touchdowns",
        line: 1.5,
        betType: "under",
        odds: 1.92,
        stake: 20,
        potentialWin: 38.40,
        status: "lost",
        placedAt: yesterday.toISOString(),
        settledAt: new Date(yesterday.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Georgia Bulldogs",
          awayTeam: "Auburn Tigers",
          gameTime: "7:00 PM ET",
          currentScore: "UGA 31 - AUB 13"
        }
      },
      // Older bets
      {
        id: "bet_6",
        prop: "REC",
        player: "Ryan Williams",
        market: "Receptions",
        line: 5.5,
        betType: "over",
        odds: 1.83,
        stake: 35,
        potentialWin: 64.05,
        status: "won",
        placedAt: twoDaysAgo.toISOString(),
        settledAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Alabama Crimson Tide",
          awayTeam: "Tennessee Volunteers",
          gameTime: "7:00 PM ET",
          currentScore: "ALA 34 - TEN 20"
        }
      },
      {
        id: "bet_7",
        prop: "RUSH_YDS",
        player: "Jam Miller",
        market: "Rushing Yards",
        line: 95.5,
        betType: "under",
        odds: 1.89,
        stake: 40,
        potentialWin: 75.60,
        status: "won",
        placedAt: twoDaysAgo.toISOString(),
        settledAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Alabama Crimson Tide",
          awayTeam: "Tennessee Volunteers",
          gameTime: "7:00 PM ET",
          currentScore: "ALA 34 - TEN 20"
        }
      },
      {
        id: "bet_8",
        prop: "PASS_YDS",
        player: "Nico Iamaleava",
        market: "Passing Yards",
        line: 225.5,
        betType: "over",
        odds: 1.85,
        stake: 30,
        potentialWin: 55.50,
        status: "lost",
        placedAt: weekAgo.toISOString(),
        settledAt: new Date(weekAgo.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        gameInfo: {
          homeTeam: "Alabama Crimson Tide",
          awayTeam: "Tennessee Volunteers",
          gameTime: "7:00 PM ET",
          currentScore: "ALA 34 - TEN 20"
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
