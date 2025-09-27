export const demoService = {
  // Simulate WebSocket connection
  connectToDemo: () => {
    console.log("Connected to demo stream")
    return {
      disconnect: () => console.log("Disconnected from demo stream"),
    }
  },

  // Generate demo pricing data
  generateDemoPricing: () => ({
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
      { name: "pace" as const, impact: 0.07 },
      { name: "minutes" as const, impact: 0.05 },
      { name: "turnovers" as const, impact: 0.03 },
    ],
  }),

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
}
