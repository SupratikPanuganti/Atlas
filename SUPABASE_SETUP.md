# Supabase Database Setup for Dynamic NFL Betting App

## Overview

This guide explains how to set up a minimal but powerful database schema to make your NFL betting application dynamic with live data, real-time updates, and user interactions.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Environment Variables

Add to your `.env` file:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 4. Run SQL Scripts

1. Run `01_create_tables.sql` in your Supabase SQL editor
2. Run `02_insert_mock_data.sql` to populate with NFL data

## 📊 Database Schema Overview

### Core Tables

#### 1. `games` - Live NFL Game Data

- **Purpose**: Track live NFL games with real-time scores and status
- **Key Fields**: `status` (scheduled/live/finished), `period`, `time_remaining`, `home_score`, `away_score`
- **Dynamic Features**: Real-time score updates, game status changes

#### 2. `players` - NFL Player Information

- **Purpose**: Store NFL player data with team and position info
- **Key Fields**: `name`, `team`, `position`
- **Dynamic Features**: Player lookup for live stats and betting lines

#### 3. `player_stats` - Live Player Statistics

- **Purpose**: Real-time player performance during games
- **Key Fields**: `passing_yards`, `rushing_yards`, `receptions`, `passing_tds`, `rushing_tds`, `receiving_tds`
- **Dynamic Features**: Live stat updates every few seconds during games

#### 4. `h2h_lines` - Head-to-Head Betting Lines

- **Purpose**: Your main feature - custom betting lines users create
- **Key Fields**: `custom_line`, `side` (over/under), `stake_credits`, `status`, `expires_at`
- **Dynamic Features**: Real-time status updates, automatic expiration, live tracking

#### 5. `h2h_matches` - Matched Betting Pairs

- **Purpose**: Track when users take opposite sides of H2H lines
- **Key Fields**: `creator_side`, `opponent_side`, `status`, `winner`
- **Dynamic Features**: Instant matching, live settlement

#### 6. `live_pricing` - Dynamic Market Data

- **Purpose**: Real-time odds and pricing for props
- **Key Fields**: `odds`, `fair_value`, `mispricing`, `confidence`
- **Dynamic Features**: Live odds updates, market analysis

## 🔥 Dynamic Features Explained

### 1. **Live Game Updates**

- **Real-time scores**: Game scores update automatically during live games
- **Period tracking**: Q1, Q2, Half, Q3, Q4, Final status
- **Time remaining**: Live countdown during games
- **Game status**: Scheduled → Live → Finished transitions

### 2. **Live Player Stats**

- **Real-time updates**: Player stats update every few seconds during games
- **Multiple stats**: Passing yards, rushing yards, receptions, TDs
- **Live tracking**: Current vs projected performance
- **Hit probability**: Real-time calculation of prop outcomes

### 3. **H2H Line Management**

- **Status transitions**: Open → Matched → Live → Settled
- **Automatic expiration**: Lines expire at game time
- **Live tracking**: Real-time progress bars and hit probabilities
- **Instant matching**: When users take opposite sides

### 4. **Real-time Pricing**

- **Live odds**: Odds update based on game flow
- **Fair value**: AI-calculated fair prices
- **Mispricing detection**: Identify value opportunities
- **Confidence scores**: How confident the model is

### 5. **Live Moment Simulation**

- **Score updates**: Random score changes during live games
- **Stat progression**: Player stats increase realistically
- **Pricing changes**: Odds adjust based on game flow
- **Settlement**: Automatic bet settlement when games end

## 🎮 Live Simulation Features

### **Real-time Game Flow**

```typescript
// Example: Live game updates
const game = {
  status: "live",
  period: "Q2",
  time_remaining: "8:45",
  home_score: 14,
  away_score: 7,
};

// Updates every 10 seconds during live games
```

### **Live Player Tracking**

```typescript
// Example: Live player stats
const playerStats = {
  passing_yards: 145, // Updates in real-time
  rushing_yards: 45,
  receptions: 6,
  passing_tds: 1,
};

// Hit probability calculation
const hitProbability = calculateHitProbability(
  currentStats,
  targetLine,
  timeRemaining
);
```

### **Dynamic H2H Lines**

```typescript
// Example: Live H2H line
const h2hLine = {
  status: "live",
  custom_line: 85.5,
  side: "over",
  current_value: 45,
  needs_value: 40.5,
  hit_probability: 0.72,
};
```

## 🚀 Frontend Integration

### **Real-time Subscriptions**

```typescript
// Subscribe to live game updates
const subscribeToGame = (gameId: string) => {
  return supabase
    .channel(`game-${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        // Update game scores, period, time remaining
        updateGameState(payload.new);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "player_stats",
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        // Update player stats and hit probabilities
        updatePlayerStats(payload.new);
      }
    )
    .subscribe();
};
```

### **Live Data Fetching**

```typescript
// Fetch active H2H lines with live data
export const fetchH2HLines = async () => {
  const { data, error } = await supabase
    .from("h2h_lines")
    .select(
      `
      *,
      games(*),
      players(*)
    `
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return data;
};

// Update player stats (for live updates)
export const updatePlayerStats = async (
  gameId: string,
  playerId: string,
  stats: any
) => {
  const { data, error } = await supabase
    .from("player_stats")
    .upsert({
      game_id: gameId,
      player_id: playerId,
      ...stats,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return data;
};
```

## 🎯 Demo Scenarios

### **1. Live Game Experience**

- **Miami Dolphins vs New York Jets** (currently live)
- **Real-time score updates**: 14-7 Dolphins
- **Live player stats**: Tua Tagovailoa 145 passing yards
- **Live H2H lines**: Tyreek Hill Over 6.5 receptions

### **2. Settled Bets**

- **San Francisco 49ers vs Seattle Seahawks** (finished)
- **Brock Purdy Over 225.5 passing yards** ✅ **WON** (227 yards)
- **Christian McCaffrey Over 120.5 rushing yards** ✅ **WON** (125 yards)

### **3. Upcoming Games**

- **Kansas City Chiefs vs Buffalo Bills** (2 hours)
- **Patrick Mahomes Over 275.5 passing yards** (open for matching)
- **Philadelphia Eagles vs Dallas Cowboys** (4 hours)
- **CeeDee Lamb Over 5.5 receptions** (open for matching)

## 🔧 Production Considerations

### **1. Authentication**

- Implement proper user authentication with Supabase Auth
- Add user-specific RLS policies
- Secure API endpoints

### **2. Performance**

- Database indexes for frequently queried columns
- Implement pagination for large datasets
- Use database functions for complex operations

### **3. Monitoring**

- Real-time monitoring for database performance
- Monitor subscription usage
- Track user engagement metrics

### **4. Data Sources**

- Integrate with real NFL data APIs (ESPN, SportsRadar, etc.)
- Set up automated data ingestion
- Implement data validation and error handling

## 📱 Next Steps

1. **Run the SQL scripts** in your Supabase SQL editor
2. **Add environment variables** to your app
3. **Install Supabase client** and update your store
4. **Test real-time subscriptions** with the sample data
5. **Replace mock data** with real API calls
6. **Add user authentication** for production use

This setup provides a solid foundation for a dynamic, real-time NFL betting application with minimal complexity while showcasing live data capabilities!
