// Service Layer Exports
// Centralized service exports for clean imports

// Core Services
export { supabase } from '../lib/supabase'
export { authService } from './authService'
export { bettingService } from './bettingService'
export { bettingLinesService } from './bettingLinesService'
export { databaseService } from './databaseService'
export { realTimeService } from './realTimeService'

// AI Services
export { openaiService } from './openaiService'
export { geminiService } from './geminiService'

// Simulation Services
export { liveSimulationService, startNCAA_Simulation, stopNCAA_Simulation } from './liveSimulationService'
export { liveTrackingService } from './liveTrackingService'
export { ncaaMockTriggerService, startNCAAMockTriggers, stopNCAAMockTriggers, triggerManualNCAAUpdate, triggerTestNotification } from './ncaaMockTriggerService'

// Data Services
export { demoService } from './demoData'

// Import services for registry
import { authService } from './authService'
import { bettingService } from './bettingService'
import { bettingLinesService } from './bettingLinesService'
import { databaseService } from './databaseService'
import { realTimeService } from './realTimeService'
import { openaiService } from './openaiService'
import { geminiService } from './geminiService'
import { liveSimulationService } from './liveSimulationService'
import { demoService } from './demoData'

// Service Registry for dependency injection
export class ServiceRegistry {
  private static services: Map<string, any> = new Map()

  static register<T>(name: string, service: T): void {
    this.services.set(name, service)
  }

  static get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found in registry`)
    }
    return service
  }

  static has(name: string): boolean {
    return this.services.has(name)
  }

  static clear(): void {
    this.services.clear()
  }
}

// Initialize services
ServiceRegistry.register('auth', authService)
ServiceRegistry.register('betting', bettingService)
ServiceRegistry.register('bettingLines', bettingLinesService)
ServiceRegistry.register('database', databaseService)
ServiceRegistry.register('realtime', realTimeService)
ServiceRegistry.register('openai', openaiService)
ServiceRegistry.register('gemini', geminiService)
ServiceRegistry.register('simulation', liveSimulationService)
ServiceRegistry.register('demo', demoService)
