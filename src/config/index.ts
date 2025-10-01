// Configuration Management
// Centralized configuration for the application

export interface AppConfig {
  supabase: {
    url: string
    anonKey: string
  }
  apis: {
    openai: {
      apiKey: string
      baseUrl: string
    }
    gemini: {
      apiKey: string
      baseUrl: string
    }
  }
  simulation: {
    ncaa: {
      enabled: boolean
      speed: number
      gameId: string
    }
    nfl: {
      enabled: boolean
      liveUpdates: boolean
    }
  }
  features: {
    aiAnalysis: boolean
    realTimeUpdates: boolean
    userFavorites: boolean
    liveSimulation: boolean
  }
}

// Environment-based configuration
const getConfig = (): AppConfig => {
  // Log environment variables for debugging (only in dev)
  if (__DEV__) {
    console.log('Environment variables loaded:', {
      hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      hasOpenAI: !!process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      hasGemini: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    })
  }

  return {
    supabase: {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
    },
    apis: {
      openai: {
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
        baseUrl: 'https://api.openai.com/v1'
      },
      gemini: {
        apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
      }
    },
    simulation: {
      ncaa: {
        enabled: true,
        speed: 2000, // 2 seconds
        gameId: 'gt_vs_wf_live'
      },
      nfl: {
        enabled: true,
        liveUpdates: false // NFL uses historical data
      }
    },
    features: {
      aiAnalysis: true,
      realTimeUpdates: true,
      userFavorites: true,
      liveSimulation: true
    }
  }
}

export const config = getConfig()

// Configuration validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!config.supabase.url) {
    errors.push('❌ EXPO_PUBLIC_SUPABASE_URL is missing from .env file')
  }
  
  if (!config.supabase.anonKey) {
    errors.push('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is missing from .env file')
  }
  
  if (config.features.aiAnalysis && !config.apis.openai.apiKey) {
    errors.push('⚠️  EXPO_PUBLIC_OPENAI_API_KEY is missing (AI features will be limited)')
  }
  
  if (config.features.aiAnalysis && !config.apis.gemini.apiKey) {
    errors.push('⚠️  EXPO_PUBLIC_GEMINI_API_KEY is missing (AI features will be limited)')
  }
  
  if (errors.length > 0) {
    console.error('\n🚨 CONFIGURATION ERRORS:\n' + errors.join('\n'))
    console.error('\n💡 Solution: Create a .env file in the root directory with required variables.')
    console.error('   See env.example for the required format.\n')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Feature flags
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature]
}

// Environment helpers
export const isDevelopment = (): boolean => {
  return __DEV__ || process.env.NODE_ENV === 'development'
}

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}
