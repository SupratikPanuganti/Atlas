import { supabase } from '../lib/supabase'

interface NCAA_Line {
  id: string
  player_name: string
  player_team: string
  prop_type: string
  line: number
  over_under: string
  delta: number
  events: string | null
  analysis: string | null
  last_updated: string
}

interface MockEvent {
  type: 'momentum' | 'injury' | 'weather' | 'scheme' | 'performance'
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  deltaChange: number // How much to change delta by
}

class NCAAMockTriggerService {
  private isRunning = false
  private updateInterval: NodeJS.Timeout | null = null
  private notificationIntervals: NodeJS.Timeout[] = []
  private store: any = null
  private currentNCAA_Lines: NCAA_Line[] = []
  private lastUpdateTime: number = 0

  // Mock events that can affect betting lines
  private readonly MOCK_EVENTS: MockEvent[] = [
    {
      type: 'momentum',
      impact: 'positive',
      description: 'Player heating up in 2nd quarter - increased usage detected',
      deltaChange: 0.15
    },
    {
      type: 'momentum',
      impact: 'negative',
      description: 'Player struggling with accuracy - completion rate dropping',
      deltaChange: -0.12
    },
    {
      type: 'injury',
      impact: 'negative',
      description: 'Key defensive player questionable - offense may exploit weakness',
      deltaChange: 0.18
    },
    {
      type: 'weather',
      impact: 'negative',
      description: 'Wind conditions affecting passing game - run game favored',
      deltaChange: -0.08
    },
    {
      type: 'scheme',
      impact: 'positive',
      description: 'Offensive coordinator adjusting play calls - more passing expected',
      deltaChange: 0.14
    },
    {
      type: 'performance',
      impact: 'positive',
      description: 'Player exceeding season averages - hot streak continues',
      deltaChange: 0.11
    },
    {
      type: 'performance',
      impact: 'negative',
      description: 'Defense tightening up - player opportunities decreasing',
      deltaChange: -0.13
    }
  ]

  // Initialize with store reference
  initialize(store: any) {
    this.store = store
  }

  // Start the mock trigger system (3-minute intervals)
  async startMockTriggers() {
    if (this.isRunning) return

    console.log('🏈 Starting NCAA mock triggers - 3 minute intervals')
    this.isRunning = true

    // Test database permissions first
    await this.testDatabasePermissions()

    // Load initial NCAA lines
    await this.loadNCAALines()

    // Start the update cycle every 3 minutes (180,000 ms)
    this.updateInterval = setInterval(async () => {
      await this.triggerMockUpdate()
    }, 180000) // 3 minutes

    // Start scheduled notifications every minute at 20s, 90s, and 140s marks
    this.startScheduledNotifications()

    // Do an initial update after 30 seconds to get things moving
    setTimeout(async () => {
      await this.triggerMockUpdate()
    }, 30000)
  }

  // Test database permissions
  private async testDatabasePermissions() {
    try {
      console.log('🔍 Testing database permissions...')
      
      // Try to update a test line
      const { data, error } = await supabase
        .from('betting_lines')
        .update({ 
          last_updated: new Date().toISOString() 
        })
        .eq('sport', 'NCAA')
        .limit(1)
        .select()

      if (error) {
        console.error('❌ Database permissions test failed:', error)
        console.error('Please run the fix_betting_lines_permissions.sql file in your Supabase SQL editor')
        return false
      } else {
        console.log('✅ Database permissions test passed')
        return true
      }
    } catch (error) {
      console.error('❌ Database permissions test error:', error)
      return false
    }
  }

  // Stop the mock trigger system
  stopMockTriggers() {
    if (!this.isRunning) return

    console.log('🏈 Stopping NCAA mock triggers')
    this.isRunning = false

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    // Clear all notification intervals
    this.notificationIntervals.forEach(interval => clearInterval(interval))
    this.notificationIntervals = []
  }

  // Start scheduled notifications every minute at specific marks
  private startScheduledNotifications() {
    console.log('🔔 Starting scheduled notifications at 20s, 90s, 140s marks')
    
    // Calculate when the next minute starts
    const now = new Date()
    const nextMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0)
    const msUntilNextMinute = nextMinute.getTime() - now.getTime()

    // Schedule notifications for each minute mark
    const scheduleNotification = (offsetMs: number, description: string) => {
      const interval = setInterval(() => {
        if (this.isRunning) {
          this.triggerScheduledNotification(description)
        }
      }, 60000 + offsetMs) // Every minute + offset
      
      this.notificationIntervals.push(interval)
      
      // Schedule the first notification
      setTimeout(() => {
        if (this.isRunning) {
          this.triggerScheduledNotification(description)
        }
      }, msUntilNextMinute + offsetMs)
    }

    // Schedule notifications at 20s, 90s, and 140s marks
    scheduleNotification(20000, 'market update')  // 20s mark
    scheduleNotification(90000, 'line movement')  // 90s mark  
    scheduleNotification(140000, 'volume spike')  // 140s mark (2:20)
  }

  // Load all NCAA betting lines from database
  private async loadNCAALines() {
    try {
      const { data, error } = await supabase
        .from('betting_lines')
        .select('*')
        .eq('sport', 'NCAA')
        .order('last_updated', { ascending: false })

      if (error) {
        console.error('Failed to load NCAA lines:', error)
        return
      }

      this.currentNCAA_Lines = data || []
      console.log(`🏈 Loaded ${this.currentNCAA_Lines.length} NCAA lines for mock updates`)
    } catch (error) {
      console.error('Error loading NCAA lines:', error)
    }
  }

  // Trigger a mock update cycle
  private async triggerMockUpdate() {
    if (this.currentNCAA_Lines.length === 0) {
      await this.loadNCAALines()
      return
    }

    console.log('🔄 Triggering NCAA mock update cycle')

    // Pick 2-4 random lines to update (not all at once for realistic feel)
    const linesToUpdate = this.getRandomLinesToUpdate()
    
    for (const line of linesToUpdate) {
      await this.updateLineWithMockData(line)
    }

    // Refresh the store's radar items to show updates
    if (this.store) {
      await this.store.refreshRadarItems('NCAA')
    }
  }

  // Get 1-3 random lines to update in this cycle (not all lines)
  private getRandomLinesToUpdate(): NCAA_Line[] {
    const numToUpdate = Math.floor(Math.random() * 3) + 1 // 1-3 lines (reduced from 2-4)
    const shuffled = [...this.currentNCAA_Lines].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, numToUpdate)
  }

  // Trigger scheduled notifications (not tied to line updates)
  private triggerScheduledNotification(type: string) {
    if (!this.store) return

    const notifications = {
      'market update': [
        { title: '📊 NCAA Market Update', subtitle: 'New betting activity detected on key lines' },
        { title: '⚡ Live Market Pulse', subtitle: 'Fresh betting data streaming in for NCAA games' },
        { title: '🎯 Opportunity Alert', subtitle: 'Market inefficiencies detected on select props' }
      ],
      'line movement': [
        { title: '📈 Line Movement Alert', subtitle: 'Significant odds shifts detected in NCAA games' },
        { title: '🔄 Odds Shift Detected', subtitle: 'Sharp line movements on key NCAA matchups' },
        { title: '⚖️ Market Correction', subtitle: 'Lines adjusting to reflect new information' }
      ],
      'volume spike': [
        { title: '🔥 Volume Spike', subtitle: 'Unusual betting volume on select NCAA props' },
        { title: '📊 High Volume Alert', subtitle: 'Heavy betting action detected on NCAA lines' },
        { title: '💥 Market Activity', subtitle: 'Surge in betting interest on specific props' }
      ]
    }

    const notificationArray = notifications[type as keyof typeof notifications]
    if (notificationArray && notificationArray.length > 0) {
      const randomNotification = notificationArray[Math.floor(Math.random() * notificationArray.length)]
      this.store.showAlertBanner(randomNotification.title, randomNotification.subtitle)
      console.log(`🔔 Scheduled notification: ${type} - ${randomNotification.title}`)
    }
  }

  // Update a specific line with mock data
  private async updateLineWithMockData(line: NCAA_Line) {
    try {
      const mockEvent = this.getRandomMockEvent()
      const newDelta = this.calculateNewDelta(line.delta, mockEvent.deltaChange)
      const newEvents = this.appendMockEvent(line.events, mockEvent)
      const newAnalysis = this.generateMockAnalysis(line, mockEvent)

      console.log(`📊 Updating ${line.player_name} ${line.prop_type}: Δ${line.delta} → Δ${newDelta.toFixed(2)}`)

      // Update the database with more comprehensive changes
      const updateData = {
        delta: newDelta,
        events: newEvents,
        analysis: newAnalysis,
        last_updated: new Date().toISOString(),
        // Also update the line slightly to make changes more visible
        line: this.adjustLineSlightly(line.line, mockEvent.deltaChange)
      }

      const { data, error } = await supabase
        .from('betting_lines')
        .update(updateData)
        .eq('id', line.id)
        .select()

      if (error) {
        console.error('Failed to update line:', error)
        console.error('Attempting fallback update without line change...')
        
        // Fallback: try updating without the line change
        const fallbackData = {
          delta: newDelta,
          events: newEvents,
          analysis: newAnalysis,
          last_updated: new Date().toISOString()
        }
        
        const { error: fallbackError } = await supabase
          .from('betting_lines')
          .update(fallbackData)
          .eq('id', line.id)
        
        if (fallbackError) {
          console.error('Fallback update also failed:', fallbackError)
          console.error('This might be a permissions issue. Run the fix_betting_lines_permissions.sql file.')
          return
        } else {
          console.log('✅ Fallback update successful')
        }
      } else {
        console.log('✅ Database update successful:', data)
      }

      // Update our local cache
      const lineIndex = this.currentNCAA_Lines.findIndex(l => l.id === line.id)
      if (lineIndex >= 0) {
        this.currentNCAA_Lines[lineIndex] = {
          ...line,
          delta: newDelta,
          events: newEvents,
          analysis: newAnalysis,
          last_updated: new Date().toISOString(),
          line: updateData.line
        }
      }

      // Trigger notification for significant changes (but not too frequently)
      if (Math.abs(mockEvent.deltaChange) >= 0.15 && Math.random() < 0.6) { // 60% chance
        this.triggerNotification(line, mockEvent, newDelta)
      }

    } catch (error) {
      console.error('Error updating line with mock data:', error)
    }
  }

  // Adjust line slightly to make changes more visible
  private adjustLineSlightly(currentLine: number, deltaChange: number): number {
    // Make small adjustments to the line (±0.5) to make changes visible
    const adjustment = deltaChange > 0 ? 0.5 : -0.5
    return Math.max(0.5, currentLine + adjustment)
  }

  // Get a random mock event
  private getRandomMockEvent(): MockEvent {
    return this.MOCK_EVENTS[Math.floor(Math.random() * this.MOCK_EVENTS.length)]
  }

  // Calculate new delta value (keep within bounds 0-2)
  private calculateNewDelta(currentDelta: number, change: number): number {
    const newDelta = currentDelta + change
    return Math.max(0.1, Math.min(2.0, newDelta)) // Keep within database constraints
  }

  // Append mock event to existing events
  private appendMockEvent(existingEvents: string | null, mockEvent: MockEvent): string {
    const timestamp = new Date().toLocaleTimeString()
    const newEvent = `[${timestamp}] ${mockEvent.description}`
    
    if (!existingEvents) {
      return newEvent
    }
    
    // Keep only last 3 events to prevent text from getting too long
    const events = existingEvents.split('\n').slice(-2)
    events.push(newEvent)
    return events.join('\n')
  }

  // Generate mock analysis based on the event
  private generateMockAnalysis(line: NCAA_Line, mockEvent: MockEvent): string {
    const baseAnalysis = `Analysis for ${line.player_name} ${line.prop_type} ${line.line} ${line.over_under}:`
    
    const analysisMap = {
      momentum: mockEvent.impact === 'positive' 
        ? 'Player showing strong momentum with increased opportunities and efficiency.'
        : 'Player momentum declining due to defensive adjustments and usage patterns.',
      injury: mockEvent.impact === 'positive'
        ? 'Opposing defense weakened by injury - favorable matchup developing.'
        : 'Key injury affecting offensive line - player opportunities may be limited.',
      weather: mockEvent.impact === 'positive'
        ? 'Weather conditions favoring current play style and player strengths.'
        : 'Weather conditions creating challenges for current offensive approach.',
      scheme: mockEvent.impact === 'positive'
        ? 'Coaching adjustments creating more favorable opportunities for player.'
        : 'Defensive scheme changes limiting player effectiveness and opportunities.',
      performance: mockEvent.impact === 'positive'
        ? 'Player exceeding expectations with strong recent performance trends.'
        : 'Player performance below season averages - regression to mean likely.'
    }

    return `${baseAnalysis}\n\n${analysisMap[mockEvent.type]}`
  }

  // Trigger notification for significant changes
  private triggerNotification(line: NCAA_Line, mockEvent: MockEvent, newDelta: number) {
    if (!this.store) return

    const changeDirection = mockEvent.deltaChange > 0 ? '📈' : '📉'
    const changePercent = Math.abs(mockEvent.deltaChange * 100).toFixed(1)
    
    this.store.showAlertBanner(
      `${changeDirection} NCAA Line Update`,
      `${line.player_name} ${line.prop_type}: Δ changed ${changePercent}% - ${mockEvent.description.substring(0, 50)}...`
    )

    console.log(`🔔 Notification triggered: ${line.player_name} delta change ${changePercent}%`)
  }

  // Get current NCAA lines (for debugging)
  getCurrentNCAALines(): NCAA_Line[] {
    return this.currentNCAA_Lines
  }

  // Check if service is running
  isMockTriggersRunning(): boolean {
    return this.isRunning
  }

  // Manual test function to trigger one update cycle immediately
  async triggerManualUpdate() {
    console.log('🧪 Manual NCAA update triggered')
    await this.triggerMockUpdate()
  }

  // Manual test function to trigger a notification immediately
  triggerTestNotification(type: 'market update' | 'line movement' | 'volume spike' = 'market update') {
    console.log(`🧪 Manual notification test: ${type}`)
    this.triggerScheduledNotification(type)
  }
}

// Export singleton instance
export const ncaaMockTriggerService = new NCAAMockTriggerService()

// Export utility functions
export const startNCAAMockTriggers = (store?: any) => {
  if (store) {
    ncaaMockTriggerService.initialize(store)
  }
  ncaaMockTriggerService.startMockTriggers()
}

export const stopNCAAMockTriggers = () => {
  ncaaMockTriggerService.stopMockTriggers()
}

export const isNCAAMockTriggersRunning = () => {
  return ncaaMockTriggerService.isMockTriggersRunning()
}

export const triggerManualNCAAUpdate = () => {
  return ncaaMockTriggerService.triggerManualUpdate()
}

export const triggerTestNotification = (type?: 'market update' | 'line movement' | 'volume spike') => {
  return ncaaMockTriggerService.triggerTestNotification(type)
}
