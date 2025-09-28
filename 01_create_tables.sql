-- Supabase Database Setup for Dynamic NFL Betting App
-- Run this script first to create all tables and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Games table for live NFL data
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT NOT NULL CHECK (sport IN ('football')),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  game_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'halftime', 'finished', 'postponed')),
  period TEXT DEFAULT NULL, -- "Q1", "Q2", "Half", "Final"
  time_remaining TEXT DEFAULT NULL, -- "8:32", "0:00"
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  sport TEXT NOT NULL CHECK (sport IN ('football')),
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Live player statistics during games
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  passing_yards INTEGER DEFAULT 0,
  rushing_yards INTEGER DEFAULT 0,
  receptions INTEGER DEFAULT 0,
  passing_tds INTEGER DEFAULT 0,
  rushing_tds INTEGER DEFAULT 0,
  receiving_tds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- 4. H2H betting lines (main feature)
CREATE TABLE h2h_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL, -- In real app, reference auth.users
  sport TEXT NOT NULL CHECK (sport IN ('football')),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  prop_type TEXT NOT NULL CHECK (prop_type IN ('passing_yards', 'rushing_yards', 'receptions', 'passing_tds', 'rushing_tds', 'receiving_tds')),
  custom_line DECIMAL(5,1) NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('over', 'under')),
  stake_credits INTEGER NOT NULL DEFAULT 100,
  payout_multiplier DECIMAL(3,2) DEFAULT 1.00,
  market_line DECIMAL(5,1),
  fair_value DECIMAL(5,1),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'live', 'settled', 'cancelled')),
  matched_with UUID, -- Opponent user ID
  matched_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Matched H2H bets
CREATE TABLE h2h_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id UUID REFERENCES h2h_lines(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  opponent_id UUID NOT NULL,
  creator_side TEXT NOT NULL CHECK (creator_side IN ('over', 'under')),
  opponent_side TEXT NOT NULL CHECK (opponent_side IN ('over', 'under')),
  stake_credits INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN ('matched', 'live', 'settled')),
  winner TEXT CHECK (winner IN ('creator', 'opponent')),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Live pricing data for props
CREATE TABLE live_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  prop_type TEXT NOT NULL,
  line DECIMAL(5,1) NOT NULL,
  odds DECIMAL(4,2) NOT NULL,
  median_line DECIMAL(5,1),
  fair_value DECIMAL(5,1),
  mispricing DECIMAL(4,3),
  ev_per_1 DECIMAL(4,3),
  confidence DECIMAL(3,2),
  last_change_ts TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_sport ON games(sport);
CREATE INDEX idx_games_time ON games(game_time);
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_player_stats_game ON player_stats(game_id);
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX idx_player_stats_updated ON player_stats(updated_at);
CREATE INDEX idx_h2h_lines_status ON h2h_lines(status);
CREATE INDEX idx_h2h_lines_sport ON h2h_lines(sport);
CREATE INDEX idx_h2h_lines_game ON h2h_lines(game_id);
CREATE INDEX idx_h2h_lines_creator ON h2h_lines(creator_id);
CREATE INDEX idx_h2h_lines_expires ON h2h_lines(expires_at);
CREATE INDEX idx_h2h_matches_line ON h2h_matches(line_id);
CREATE INDEX idx_h2h_matches_creator ON h2h_matches(creator_id);
CREATE INDEX idx_h2h_matches_opponent ON h2h_matches(opponent_id);
CREATE INDEX idx_h2h_matches_status ON h2h_matches(status);
CREATE INDEX idx_live_pricing_game ON live_pricing(game_id);
CREATE INDEX idx_live_pricing_player ON live_pricing(player_id);
CREATE INDEX idx_live_pricing_updated ON live_pricing(last_change_ts);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE h2h_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE h2h_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_pricing ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo (adjust for production)
CREATE POLICY "Allow public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON player_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON h2h_lines FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON h2h_matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON live_pricing FOR SELECT USING (true);

-- Allow inserts for demo purposes
CREATE POLICY "Allow public insert" ON h2h_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON h2h_matches FOR INSERT WITH CHECK (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE player_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE h2h_lines;
ALTER PUBLICATION supabase_realtime ADD TABLE h2h_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE live_pricing;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_game_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamps
CREATE TRIGGER update_games_timestamp
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_game_status();

CREATE TRIGGER update_h2h_lines_timestamp
  BEFORE UPDATE ON h2h_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_game_status();

CREATE TRIGGER update_player_stats_timestamp
  BEFORE UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_game_status();

-- Function to simulate live game updates
CREATE OR REPLACE FUNCTION simulate_live_game_updates()
RETURNS void AS $$
BEGIN
  -- Update live game scores randomly
  UPDATE games 
  SET 
    home_score = home_score + CASE WHEN random() < 0.1 THEN floor(random() * 3) ELSE 0 END,
    away_score = away_score + CASE WHEN random() < 0.1 THEN floor(random() * 3) ELSE 0 END,
    updated_at = NOW()
  WHERE status = 'live';
  
  -- Update player stats randomly
  UPDATE player_stats ps
  SET 
    passing_yards = passing_yards + CASE WHEN random() < 0.05 THEN floor(random() * 20) ELSE 0 END,
    rushing_yards = rushing_yards + CASE WHEN random() < 0.03 THEN floor(random() * 10) ELSE 0 END,
    receptions = receptions + CASE WHEN random() < 0.02 THEN 1 ELSE 0 END,
    updated_at = NOW()
  FROM games g
  WHERE ps.game_id = g.id AND g.status = 'live';
  
  -- Update live pricing
  UPDATE live_pricing
  SET 
    odds = odds + (random() - 0.5) * 0.1,
    last_change_ts = NOW()
  WHERE random() < 0.2; -- 20% chance of update
END;
$$ LANGUAGE plpgsql;
