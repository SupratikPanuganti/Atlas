-- Mock Data for Dynamic NFL Betting App
-- Run this script after 01_create_tables.sql

-- Insert NFL games
INSERT INTO games (sport, home_team, away_team, game_time, status, period, time_remaining, home_score, away_score) VALUES
('football', 'Kansas City Chiefs', 'Buffalo Bills', NOW() + INTERVAL '2 hours', 'scheduled', NULL, NULL, 0, 0),
('football', 'Miami Dolphins', 'New York Jets', NOW() - INTERVAL '30 minutes', 'live', 'Q2', '8:45', 14, 7),
('football', 'Philadelphia Eagles', 'Dallas Cowboys', NOW() + INTERVAL '4 hours', 'scheduled', NULL, NULL, 0, 0),
('football', 'San Francisco 49ers', 'Seattle Seahawks', NOW() - INTERVAL '2 hours', 'finished', 'Final', '0:00', 31, 13),
('football', 'Detroit Lions', 'Green Bay Packers', NOW() + INTERVAL '6 hours', 'scheduled', NULL, NULL, 0, 0);

-- Insert NFL players
INSERT INTO players (name, team, sport, position) VALUES
-- Kansas City Chiefs
('Patrick Mahomes', 'Kansas City Chiefs', 'football', 'QB'),
('Travis Kelce', 'Kansas City Chiefs', 'football', 'TE'),
('Isiah Pacheco', 'Kansas City Chiefs', 'football', 'RB'),
('Rashee Rice', 'Kansas City Chiefs', 'football', 'WR'),
-- Buffalo Bills
('Josh Allen', 'Buffalo Bills', 'football', 'QB'),
('Stefon Diggs', 'Buffalo Bills', 'football', 'WR'),
('James Cook', 'Buffalo Bills', 'football', 'RB'),
('Dawson Knox', 'Buffalo Bills', 'football', 'TE'),
-- Miami Dolphins
('Tua Tagovailoa', 'Miami Dolphins', 'football', 'QB'),
('Tyreek Hill', 'Miami Dolphins', 'football', 'WR'),
('Raheem Mostert', 'Miami Dolphins', 'football', 'RB'),
('Jaylen Waddle', 'Miami Dolphins', 'football', 'WR'),
-- New York Jets
('Aaron Rodgers', 'New York Jets', 'football', 'QB'),
('Breece Hall', 'New York Jets', 'football', 'RB'),
('Garrett Wilson', 'New York Jets', 'football', 'WR'),
('Tyler Conklin', 'New York Jets', 'football', 'TE'),
-- Philadelphia Eagles
('Jalen Hurts', 'Philadelphia Eagles', 'football', 'QB'),
('A.J. Brown', 'Philadelphia Eagles', 'football', 'WR'),
('D''Andre Swift', 'Philadelphia Eagles', 'football', 'RB'),
('Dallas Goedert', 'Philadelphia Eagles', 'football', 'TE'),
-- Dallas Cowboys
('Dak Prescott', 'Dallas Cowboys', 'football', 'QB'),
('CeeDee Lamb', 'Dallas Cowboys', 'football', 'WR'),
('Tony Pollard', 'Dallas Cowboys', 'football', 'RB'),
('Jake Ferguson', 'Dallas Cowboys', 'football', 'TE'),
-- San Francisco 49ers
('Brock Purdy', 'San Francisco 49ers', 'football', 'QB'),
('Christian McCaffrey', 'San Francisco 49ers', 'football', 'RB'),
('Deebo Samuel', 'San Francisco 49ers', 'football', 'WR'),
('George Kittle', 'San Francisco 49ers', 'football', 'TE'),
-- Seattle Seahawks
('Geno Smith', 'Seattle Seahawks', 'football', 'QB'),
('Kenneth Walker III', 'Seattle Seahawks', 'football', 'RB'),
('DK Metcalf', 'Seattle Seahawks', 'football', 'WR'),
('Tyler Lockett', 'Seattle Seahawks', 'football', 'WR'),
-- Detroit Lions
('Jared Goff', 'Detroit Lions', 'football', 'QB'),
('Amon-Ra St. Brown', 'Detroit Lions', 'football', 'WR'),
('David Montgomery', 'Detroit Lions', 'football', 'RB'),
('Sam LaPorta', 'Detroit Lions', 'football', 'TE'),
-- Green Bay Packers
('Jordan Love', 'Green Bay Packers', 'football', 'QB'),
('Aaron Jones', 'Green Bay Packers', 'football', 'RB'),
('Christian Watson', 'Green Bay Packers', 'football', 'WR'),
('Luke Musgrave', 'Green Bay Packers', 'football', 'TE');

-- Insert live player stats for the Miami vs Jets game
INSERT INTO player_stats (game_id, player_id, passing_yards, rushing_yards, receptions, passing_tds, rushing_tds, receiving_tds)
SELECT
  g.id,
  p.id,
  CASE
    WHEN p.name = 'Tua Tagovailoa' THEN 145
    WHEN p.name = 'Aaron Rodgers' THEN 98
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Raheem Mostert' THEN 45
    WHEN p.name = 'Breece Hall' THEN 32
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Tyreek Hill' THEN 6
    WHEN p.name = 'Jaylen Waddle' THEN 4
    WHEN p.name = 'Garrett Wilson' THEN 5
    WHEN p.name = 'Tyler Conklin' THEN 3
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Tua Tagovailoa' THEN 1
    WHEN p.name = 'Aaron Rodgers' THEN 0
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Raheem Mostert' THEN 1
    WHEN p.name = 'Breece Hall' THEN 0
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Tyreek Hill' THEN 1
    WHEN p.name = 'Jaylen Waddle' THEN 0
    WHEN p.name = 'Garrett Wilson' THEN 0
    WHEN p.name = 'Tyler Conklin' THEN 0
    ELSE 0
  END
FROM games g
JOIN players p ON p.team IN (g.home_team, g.away_team)
WHERE g.home_team = 'Miami Dolphins' AND g.away_team = 'New York Jets' AND g.sport = 'football';

-- Insert final player stats for the 49ers vs Seahawks game
INSERT INTO player_stats (game_id, player_id, passing_yards, rushing_yards, receptions, passing_tds, rushing_tds, receiving_tds)
SELECT
  g.id,
  p.id,
  CASE
    WHEN p.name = 'Brock Purdy' THEN 227
    WHEN p.name = 'Geno Smith' THEN 198
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Christian McCaffrey' THEN 125
    WHEN p.name = 'Kenneth Walker III' THEN 89
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Deebo Samuel' THEN 4
    WHEN p.name = 'George Kittle' THEN 3
    WHEN p.name = 'DK Metcalf' THEN 5
    WHEN p.name = 'Tyler Lockett' THEN 2
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Brock Purdy' THEN 2
    WHEN p.name = 'Geno Smith' THEN 1
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Christian McCaffrey' THEN 1
    WHEN p.name = 'Kenneth Walker III' THEN 0
    ELSE 0
  END,
  CASE
    WHEN p.name = 'Deebo Samuel' THEN 1
    WHEN p.name = 'George Kittle' THEN 1
    WHEN p.name = 'DK Metcalf' THEN 1
    WHEN p.name = 'Tyler Lockett' THEN 0
    ELSE 0
  END
FROM games g
JOIN players p ON p.team IN (g.home_team, g.away_team)
WHERE g.home_team = 'San Francisco 49ers' AND g.away_team = 'Seattle Seahawks' AND g.sport = 'football';

-- Insert sample H2H lines
INSERT INTO h2h_lines (creator_id, sport, game_id, player_id, prop_type, custom_line, side, stake_credits, market_line, fair_value, status, expires_at)
SELECT
  'user123'::uuid,
  'football',
  g.id,
  p.id,
  'passing_yards',
  225.5,
  'over',
  200,
  220.0,
  227.0,
  'settled',
  NOW() - INTERVAL '1 hour'
FROM games g
JOIN players p ON p.name = 'Brock Purdy'
WHERE g.home_team = 'San Francisco 49ers' AND g.away_team = 'Seattle Seahawks';

INSERT INTO h2h_lines (creator_id, sport, game_id, player_id, prop_type, custom_line, side, stake_credits, market_line, fair_value, status, expires_at)
SELECT
  'user456'::uuid,
  'football',
  g.id,
  p.id,
  'rushing_yards',
  120.5,
  'over',
  150,
  115.0,
  125.0,
  'settled',
  NOW() - INTERVAL '1 hour'
FROM games g
JOIN players p ON p.name = 'Christian McCaffrey'
WHERE g.home_team = 'San Francisco 49ers' AND g.away_team = 'Seattle Seahawks';

INSERT INTO h2h_lines (creator_id, sport, game_id, player_id, prop_type, custom_line, side, stake_credits, market_line, fair_value, status, expires_at)
SELECT
  'user789'::uuid,
  'football',
  g.id,
  p.id,
  'passing_yards',
  275.5,
  'over',
  200,
  270.0,
  280.0,
  'open',
  NOW() + INTERVAL '2 hours'
FROM games g
JOIN players p ON p.name = 'Patrick Mahomes'
WHERE g.home_team = 'Kansas City Chiefs' AND g.away_team = 'Buffalo Bills';

INSERT INTO h2h_lines (creator_id, sport, game_id, player_id, prop_type, custom_line, side, stake_credits, market_line, fair_value, status, expires_at)
SELECT
  'user101'::uuid,
  'football',
  g.id,
  p.id,
  'receptions',
  6.5,
  'over',
  175,
  6.0,
  6.8,
  'live',
  NOW() + INTERVAL '1 hour'
FROM games g
JOIN players p ON p.name = 'Tyreek Hill'
WHERE g.home_team = 'Miami Dolphins' AND g.away_team = 'New York Jets';

INSERT INTO h2h_lines (creator_id, sport, game_id, player_id, prop_type, custom_line, side, stake_credits, market_line, fair_value, status, expires_at)
SELECT
  'user202'::uuid,
  'football',
  g.id,
  p.id,
  'rushing_yards',
  85.5,
  'over',
  150,
  80.0,
  90.0,
  'live',
  NOW() + INTERVAL '1 hour'
FROM games g
JOIN players p ON p.name = 'Raheem Mostert'
WHERE g.home_team = 'Miami Dolphins' AND g.away_team = 'New York Jets';

INSERT INTO h2h_lines (creator_id, sport, game_id, player_id, prop_type, custom_line, side, stake_credits, market_line, fair_value, status, expires_at)
SELECT
  'user303'::uuid,
  'football',
  g.id,
  p.id,
  'receptions',
  5.5,
  'over',
  125,
  5.0,
  5.8,
  'open',
  NOW() + INTERVAL '4 hours'
FROM games g
JOIN players p ON p.name = 'CeeDee Lamb'
WHERE g.home_team = 'Philadelphia Eagles' AND g.away_team = 'Dallas Cowboys';

-- Insert sample live pricing data
INSERT INTO live_pricing (game_id, player_id, prop_type, line, odds, median_line, fair_value, mispricing, ev_per_1, confidence)
SELECT
  g.id,
  p.id,
  'passing_yards',
  275.5,
  1.85,
  270.0,
  280.0,
  0.108,
  0.238,
  0.78
FROM games g
JOIN players p ON p.name = 'Patrick Mahomes'
WHERE g.home_team = 'Kansas City Chiefs' AND g.away_team = 'Buffalo Bills';

INSERT INTO live_pricing (game_id, player_id, prop_type, line, odds, median_line, fair_value, mispricing, ev_per_1, confidence)
SELECT
  g.id,
  p.id,
  'receptions',
  6.5,
  1.90,
  6.0,
  6.8,
  0.091,
  0.191,
  0.72
FROM games g
JOIN players p ON p.name = 'Tyreek Hill'
WHERE g.home_team = 'Miami Dolphins' AND g.away_team = 'New York Jets';

INSERT INTO live_pricing (game_id, player_id, prop_type, line, odds, median_line, fair_value, mispricing, ev_per_1, confidence)
SELECT
  g.id,
  p.id,
  'rushing_yards',
  85.5,
  1.88,
  80.0,
  90.0,
  0.095,
  0.201,
  0.75
FROM games g
JOIN players p ON p.name = 'Raheem Mostert'
WHERE g.home_team = 'Miami Dolphins' AND g.away_team = 'New York Jets';

INSERT INTO live_pricing (game_id, player_id, prop_type, line, odds, median_line, fair_value, mispricing, ev_per_1, confidence)
SELECT
  g.id,
  p.id,
  'receptions',
  5.5,
  1.92,
  5.0,
  5.8,
  0.087,
  0.184,
  0.69
FROM games g
JOIN players p ON p.name = 'CeeDee Lamb'
WHERE g.home_team = 'Philadelphia Eagles' AND g.away_team = 'Dallas Cowboys';
