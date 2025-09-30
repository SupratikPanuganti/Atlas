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
    errors.push('Supabase URL is required')
  }
  
  if (!config.supabase.anonKey) {
    errors.push('Supabase anon key is required')
  }
  
  if (config.features.aiAnalysis && !config.apis.openai.apiKey) {
    errors.push('OpenAI API key is required for AI analysis')
  }
  
  if (config.features.aiAnalysis && !config.apis.gemini.apiKey) {
    errors.push('Gemini API key is required for AI analysis')
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
