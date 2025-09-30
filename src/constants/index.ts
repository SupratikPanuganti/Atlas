// Application Constants
// Centralized constants for consistent usage across the app

// API Endpoints
export const API_ENDPOINTS = {
  OPENAI: {
    CHAT: 'https://api.openai.com/v1/chat/completions',
    MODELS: 'https://api.openai.com/v1/models'
  },
  GEMINI: {
    GENERATE: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  }
} as const

// Database Table Names
export const DB_TABLES = {
  USERS: 'users',
  USER_FAVORITES: 'user_favorites',
  GAMES: 'games',
  PLAYERS: 'players',
  PLAYER_STATS: 'player_stats',
  H2H_LINES: 'h2h_lines',
  H2H_MATCHES: 'h2h_matches',
  LIVE_PRICING: 'live_pricing'
} as const

// Game Statuses
export const GAME_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
} as const

// H2H Line Statuses
export const H2H_STATUS = {
  OPEN: 'open',
  MATCHED: 'matched',
  LIVE: 'live',
  SETTLED: 'settled',
  CANCELLED: 'cancelled'
} as const

// Bet Statuses
export const BET_STATUS = {
  PENDING: 'pending',
  WON: 'won',
  LOST: 'lost',
  PUSH: 'push',
  CANCELLED: 'cancelled'
} as const

// Prop Types
export const PROP_TYPES = {
  PASSING_YARDS: 'passing_yards',
  RUSHING_YARDS: 'rushing_yards',
  RECEPTIONS: 'receptions',
  PASSING_TDS: 'passing_tds',
  RUSHING_TDS: 'rushing_tds',
  RECEIVING_TDS: 'receiving_tds'
} as const

// Bet Sides
export const BET_SIDES = {
  OVER: 'over',
  UNDER: 'under'
} as const

// Sports
export const SPORTS = {
  FOOTBALL: 'football',
  BASKETBALL: 'basketball',
  BASEBALL: 'baseball'
} as const

// NCAA Teams
export const NCAA_TEAMS = {
  GEORGIA_TECH: 'Georgia Tech Yellow Jackets',
  WAKE_FOREST: 'Wake Forest Demon Deacons'
} as const

// NFL Teams (Week 4 - 9/28/2024)
export const NFL_TEAMS = {
  VIKINGS: 'Minnesota Vikings',
  STEELERS: 'Pittsburgh Steelers',
  FALCONS: 'Atlanta Falcons',
  COMMANDERS: 'Washington Commanders',
  BILLS: 'Buffalo Bills',
  SAINTS: 'New Orleans Saints',
  LIONS: 'Detroit Lions',
  BROWNS: 'Cleveland Browns',
  TEXANS: 'Houston Texans',
  TITANS: 'Tennessee Titans',
  PATRIOTS: 'New England Patriots',
  PANTHERS: 'Carolina Panthers',
  CHARGERS: 'Los Angeles Chargers',
  GIANTS: 'New York Giants',
  EAGLES: 'Philadelphia Eagles',
  BUCCANEERS: 'Tampa Bay Buccaneers',
  COLTS: 'Indianapolis Colts',
  RAMS: 'Los Angeles Rams',
  JAGUARS: 'Jacksonville Jaguars',
  NINERS: 'San Francisco 49ers',
  RAVENS: 'Baltimore Ravens',
  CHIEFS: 'Kansas City Chiefs',
  BEARS: 'Chicago Bears',
  RAIDERS: 'Las Vegas Raiders',
  COWBOYS: 'Dallas Cowboys',
  PACKERS: 'Green Bay Packers',
  JETS: 'New York Jets',
  DOLPHINS: 'Miami Dolphins',
  BENGALS: 'Cincinnati Bengals',
  BRONCOS: 'Denver Broncos'
} as const

// Game Times (Week 4 - 9/28/2024)
export const GAME_TIMES = {
  EARLY: '2024-09-28 17:00:00+00', // 1:00 PM ET
  LATE: '2024-09-28 20:05:00+00',  // 4:05 PM ET
  LATE_ALT: '2024-09-28 20:25:00+00', // 4:25 PM ET
  SNF: '2024-09-29 00:20:00+00',   // 8:20 PM ET (Sunday Night)
  MNF: '2024-09-30 00:15:00+00'    // 8:15 PM ET (Monday Night)
} as const

// Simulation Settings
export const SIMULATION = {
  NCAA: {
    GAME_ID: 'gt_vs_wf_live',
    SPEED: 2000, // 2 seconds
    DURATION: 180000, // 3 minutes
    START_TIME: '2024-09-27 19:30:00+00'
  },
  NFL: {
    LIVE_UPDATES: false,
    USE_HISTORICAL: true
  }
} as const

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_RETRIES: 3,
  TIMEOUT: 10000 // 10 seconds
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  AUTH: 'Authentication failed. Please try again.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  RATE_LIMIT: 'Too many requests. Please wait and try again.'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  SIGNUP: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  BET_PLACED: 'Bet placed successfully!',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
} as const

// Default Values
export const DEFAULTS = {
  USER_CREDITS: 1000,
  STAKE_CREDITS: 100,
  PAYOUT_MULTIPLIER: 1.0,
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_FAVORITES: 50,
  MAX_BETS_PER_USER: 100,
  REFRESH_RATE: 5000 // 5 seconds
} as const

// Feature Flags
export const FEATURES = {
  AI_ANALYSIS: true,
  REAL_TIME_UPDATES: true,
  USER_FAVORITES: true,
  LIVE_SIMULATION: true,
  CHAT_FUNCTIONALITY: true,
  ADVANCED_FILTERS: true,
  PUSH_NOTIFICATIONS: false,
  DARK_MODE: true
} as const

// Validation Rules
export const VALIDATION = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/
  },
  BET_AMOUNT: {
    MIN: 1,
    MAX: 10000
  },
  CUSTOM_LINE: {
    MIN: 0.5,
    MAX: 1000,
    STEP: 0.5
  }
} as const
