// Component Exports
// Centralized component exports for clean imports

// UI Components
export { Button } from './ui/Button'
export { Card } from './ui/Card'
export { Chip } from './ui/Chip'
export { Slider } from './ui/Slider'
export { Switch } from './ui/Switch'

// Animation Components
export { AnimatedProgressBar } from './animations/AnimatedProgressBar'
export { FadeInView } from './animations/FadeInView'
export { LoadingSkeleton } from './animations/LoadingSkeleton'
export { PressableCard } from './animations/PressableCard'
export { SlideInView } from './animations/SlideInView'

// Feature Components
export { ActiveBets } from './ActiveBets'
export { AIReport } from './AIReport'
export { AlertBanner } from './AlertBanner'
export { BetHistory } from './BetHistory'
export { BetItem } from './BetItem'
export { BettingStatsCards } from './BettingStatsCards'
export { CalibrationChart } from './CalibrationChart'
export { ExplainDrawer } from './ExplainDrawer'
export { H2HLineCard } from './H2HLineCard'
export { MetricsBlock } from './MetricsBlock'
export { MomentFeed } from './MomentFeed'
export { PercentageChart } from './PercentageChart'
export { PriceCard } from './PriceCard'
export { RadarFilters } from './RadarFilters'
export { RadarRow } from './RadarRow'
export { ShadcnLineChart } from './ShadcnLineChart'
export { YesterdayBuckets } from './YesterdayBuckets'

// Modal Components
export { AuthModal } from './AuthModal'

// Component Registry for dynamic loading
export class ComponentRegistry {
  private static components: Map<string, React.ComponentType<any>> = new Map()

  static register<T extends React.ComponentType<any>>(name: string, component: T): void {
    this.components.set(name, component)
  }

  static get<T extends React.ComponentType<any>>(name: string): T {
    const component = this.components.get(name)
    if (!component) {
      throw new Error(`Component ${name} not found in registry`)
    }
    return component as T
  }

  static has(name: string): boolean {
    return this.components.has(name)
  }

  static getAll(): Map<string, React.ComponentType<any>> {
    return new Map(this.components)
  }

  static clear(): void {
    this.components.clear()
  }
}

// Register components
ComponentRegistry.register('Button', Button)
ComponentRegistry.register('Card', Card)
ComponentRegistry.register('Chip', Chip)
ComponentRegistry.register('Slider', Slider)
ComponentRegistry.register('Switch', Switch)
ComponentRegistry.register('AnimatedProgressBar', AnimatedProgressBar)
ComponentRegistry.register('FadeInView', FadeInView)
ComponentRegistry.register('LoadingSkeleton', LoadingSkeleton)
ComponentRegistry.register('PressableCard', PressableCard)
ComponentRegistry.register('SlideInView', SlideInView)
ComponentRegistry.register('ActiveBets', ActiveBets)
ComponentRegistry.register('AIReport', AIReport)
ComponentRegistry.register('AlertBanner', AlertBanner)
ComponentRegistry.register('BetHistory', BetHistory)
ComponentRegistry.register('BetItem', BetItem)
ComponentRegistry.register('BettingStatsCards', BettingStatsCards)
ComponentRegistry.register('CalibrationChart', CalibrationChart)
ComponentRegistry.register('ExplainDrawer', ExplainDrawer)
ComponentRegistry.register('H2HLineCard', H2HLineCard)
ComponentRegistry.register('MetricsBlock', MetricsBlock)
ComponentRegistry.register('MomentFeed', MomentFeed)
ComponentRegistry.register('PercentageChart', PercentageChart)
ComponentRegistry.register('PriceCard', PriceCard)
ComponentRegistry.register('RadarFilters', RadarFilters)
ComponentRegistry.register('RadarRow', RadarRow)
ComponentRegistry.register('ShadcnLineChart', ShadcnLineChart)
ComponentRegistry.register('YesterdayBuckets', YesterdayBuckets)
ComponentRegistry.register('AuthModal', AuthModal)
