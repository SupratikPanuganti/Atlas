// Application Initialization
// Centralized app initialization and configuration

import { config, validateConfig } from '../config'
import { logger } from '../utils'
import { errorHandler } from '../utils/errorHandler'
import { testSupabaseConnection } from '../lib/supabase'
import { ServiceRegistry } from '../services'

export class AppInitializer {
  private static instance: AppInitializer
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null

  static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer()
    }
    return AppInitializer.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.performInitialization()
    return this.initializationPromise
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('Starting application initialization...')

      // Step 1: Validate configuration
      await this.validateConfiguration()

      // Step 2: Test database connection
      await this.testDatabaseConnection()

      // Step 3: Initialize services
      await this.initializeServices()

      // Step 4: Setup error handling
      this.setupErrorHandling()

      // Step 5: Log initialization success
      logger.info('Application initialization completed successfully')
      this.isInitialized = true

    } catch (error) {
      logger.error('Application initialization failed:', error)
      errorHandler.handleError(error as Error, { phase: 'initialization' })
      throw error
    }
  }

  private async validateConfiguration(): Promise<void> {
    logger.info('Validating configuration...')
    
    const validation = validateConfig()
    if (!validation.isValid) {
      const error = new Error(`Configuration validation failed: ${validation.errors.join(', ')}`)
      logger.error('Configuration validation failed:', validation.errors)
      throw error
    }

    logger.info('Configuration validation passed')
  }

  private async testDatabaseConnection(): Promise<void> {
    logger.info('Testing database connection...')
    
    const isConnected = await testSupabaseConnection()
    if (!isConnected) {
      const error = new Error('Database connection test failed')
      logger.error('Database connection test failed')
      throw error
    }

    logger.info('Database connection test passed')
  }

  private async initializeServices(): Promise<void> {
    logger.info('Initializing services...')

    try {
      // Services are already registered in the service index
      // Here we can perform any additional initialization
      
      // Example: Initialize real-time service
      const realTimeService = ServiceRegistry.get('realtime')
      if (realTimeService && typeof realTimeService.initialize === 'function') {
        await realTimeService.initialize()
      }

      // Example: Initialize simulation service
      const simulationService = ServiceRegistry.get('simulation')
      if (simulationService && typeof simulationService.initialize === 'function') {
        await simulationService.initialize()
      }

      logger.info('Services initialized successfully')
    } catch (error) {
      logger.error('Service initialization failed:', error)
      throw error
    }
  }

  private setupErrorHandling(): void {
    logger.info('Setting up error handling...')

    // Global error handler for unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled promise rejection:', event.reason)
        errorHandler.handleError(event.reason, { type: 'unhandledRejection' })
      })

      // Global error handler for uncaught errors
      window.addEventListener('error', (event) => {
        logger.error('Uncaught error:', event.error)
        errorHandler.handleError(event.error, { type: 'uncaughtError' })
      })
    }

    logger.info('Error handling setup completed')
  }

  // Health check
  async healthCheck(): Promise<{
    isHealthy: boolean
    services: Record<string, boolean>
    errors: string[]
  }> {
    const health = {
      isHealthy: true,
      services: {} as Record<string, boolean>,
      errors: [] as string[]
    }

    try {
      // Check database connection
      const dbHealthy = await testSupabaseConnection()
      health.services.database = dbHealthy
      if (!dbHealthy) {
        health.errors.push('Database connection failed')
        health.isHealthy = false
      }

      // Check configuration
      const configValidation = validateConfig()
      health.services.configuration = configValidation.isValid
      if (!configValidation.isValid) {
        health.errors.push(`Configuration errors: ${configValidation.errors.join(', ')}`)
        health.isHealthy = false
      }

      // Check services
      const serviceNames = ['auth', 'database', 'realtime', 'openai', 'gemini', 'simulation', 'demo']
      for (const serviceName of serviceNames) {
        const serviceExists = ServiceRegistry.has(serviceName)
        health.services[serviceName] = serviceExists
        if (!serviceExists) {
          health.errors.push(`Service ${serviceName} not available`)
          health.isHealthy = false
        }
      }

    } catch (error) {
      logger.error('Health check failed:', error)
      health.isHealthy = false
      health.errors.push(`Health check error: ${(error as Error).message}`)
    }

    return health
  }

  // Get initialization status
  getInitializationStatus(): {
    isInitialized: boolean
    isInitializing: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.initializationPromise !== null && !this.isInitialized
    }
  }

  // Reset initialization (for testing)
  reset(): void {
    this.isInitialized = false
    this.initializationPromise = null
    errorHandler.clearErrorLog()
  }
}

// Export singleton instance
export const appInitializer = AppInitializer.getInstance()

// Convenience function for app initialization
export const initializeApp = async (): Promise<void> => {
  return appInitializer.initialize()
}

// Convenience function for health check
export const checkAppHealth = async () => {
  return appInitializer.healthCheck()
}
