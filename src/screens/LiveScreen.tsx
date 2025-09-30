"use client"

import { useState, useEffect } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { RootStackParamList } from "../types/navigation"
import { BarChart3 } from "lucide-react-native"
import { PriceCard } from "../components/PriceCard"
import { AlertBanner } from "../components/AlertBanner"
import { ExplainDrawer } from "../components/ExplainDrawer"
import { MomentFeed } from "../components/MomentFeed"
import { AIReport } from "../components/AIReport"
import { ShadcnLineChart } from "../components/ShadcnLineChart"

interface ChartPoint {
  time: string
  percentage: number
  ev?: number  // Expected Value
  confidence?: number  // Confidence level (0-1)
  factors?: string[]  // Key factors driving this recommendation
  currentTotal?: number  // Current total for the prop (PRA, points, assists, etc.)
  targetLine?: number  // The line they need to hit (e.g., 42.5 for PRA)
  insight?: string
  type: 'peak' | 'trough' | 'normal'
  gameEvent?: string
}
import { useAppStore } from "../store/useAppStore"
import { demoService } from "../services/demoData"
import { bettingLinesService } from "../services/bettingLinesService"
import { geminiService } from "../services/geminiService"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import { FadeInView, SlideInView } from "../components/animations"

type LiveScreenRouteProp = RouteProp<RootStackParamList, 'LivePricing'>

export default function LiveScreen() {
  const { currentPricing, showAlert, alertData, hideAlert } = useAppStore()
  const navigation = useNavigation()
  const route = useRoute<LiveScreenRouteProp>()
  const [showExplain, setShowExplain] = useState(false)
  const [selectedChartPoint, setSelectedChartPoint] = useState<ChartPoint | null>(null)
  const [bettingLineData, setBettingLineData] = useState<any>(null)
  const [liveReasoning, setLiveReasoning] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [geminiLoading, setGeminiLoading] = useState(false)
  
  // Get route parameters if available
  const lineId = route.params?.lineId
  const lineData = route.params?.lineData
  const stake = route.params?.stake
  const potential = route.params?.potential

  // Fetch betting line data and generate live reasoning
  useEffect(() => {
    const fetchBettingData = async () => {
      try {
        setLoading(true)
        
        // If we have lineData from navigation, use it
        if (lineData && typeof lineData === 'object') {
          console.log('LiveScreen: Using lineData from navigation:', lineData)
          console.log('LiveScreen: Source - Active Bets vs Radar:', lineData.betting_line_id ? 'Active Bets' : 'Radar')
          setBettingLineData(lineData)
          
          // Generate live reasoning using events data with Gemini AI
          if (lineData.events) {
            console.log('LiveScreen: Found events data:', lineData.events)
            
            try {
              const playerName = lineData.player_name || lineData.player || 'Player'
              const propType = lineData.prop_type || lineData.prop || 'prop'
              const line = lineData.line || 0
              
              console.log('LiveScreen: Calling Gemini with:', {
                playerName,
                propType,
                line,
                events: lineData.events
              })
              
              setGeminiLoading(true)
              setLiveReasoning('Generating AI analysis...')
              
              const liveReasoningText = await geminiService.analyzePropLine(
                playerName, 
                propType, 
                line, 
                'football', 
                line,
                lineData.events
              )
              
              console.log('LiveScreen: Gemini response:', liveReasoningText)
              
              // Use the explanation from Gemini, with fallback to events text
              setLiveReasoning(liveReasoningText.explanation || `Live update: ${lineData.events}`)
            } catch (error) {
              console.error('Error generating live reasoning with Gemini:', error)
              // Fallback to simple events display if Gemini fails
              setLiveReasoning(`Live update: ${lineData.events}`)
            } finally {
              setGeminiLoading(false)
            }
          } else {
            console.log('LiveScreen: No events data found')
            setLiveReasoning('Live analysis unavailable - no events data')
          }
          
          // Log analysis data for historical reasoning
          if (lineData.analysis) {
            console.log('LiveScreen: Found analysis data for historical reasoning:', lineData.analysis)
            console.log('LiveScreen: Analysis data length:', lineData.analysis.length)
          } else {
            console.log('LiveScreen: No analysis data found in lineData - will use fallback')
          }
          
          // Log all available fields in lineData for debugging
          console.log('LiveScreen: All lineData fields:', Object.keys(lineData))
        } else {
          // Fallback to mock data
          setBettingLineData(null)
          setLiveReasoning('Live analysis unavailable')
        }
      } catch (error) {
        console.error('Error fetching betting data:', error)
        setBettingLineData(null)
        setLiveReasoning('Live analysis unavailable')
      } finally {
        setLoading(false)
      }
    }

    fetchBettingData()
  }, [lineData])

  // Demo data
  const demoPricing = {
    propId: "PASS_YDS_over_275.5_player123",
    worthPer1: 0.28,
    pFair: 0.68,
    fairPrice: 0.558,
    marketPrice: 0.45,
    mispricing: 0.108,
    evPer1: 0.238,
    thetaPer30s: -0.01,
    band: { lo: 0.52, hi: 0.59 },
    fairOdds: 1.47,
    onExplain: () => setShowExplain(true),
  }

  // Determine scenario based on the clicked prop or use passing_yards as default
  const getScenarioFromPropId = (propId?: string): 'passing_yards' | 'rushing_yards' | 'receptions' => {
    if (!propId) return 'passing_yards'
    
    if (propId.includes('PASS_YDS') || propId.includes('PASS_TD')) return 'passing_yards'
    if (propId.includes('RUSH_YDS') || propId.includes('RUSH_TD')) return 'rushing_yards'
    if (propId.includes('REC') || propId.includes('REC_YDS')) return 'receptions'
    
    return 'passing_yards' // default
  }

  // Use the scenario based on the actual clicked prop
  const scenario = getScenarioFromPropId(lineData?.propId)
  const demoPricingData = demoService.generateDemoPricing(scenario)
  const demoDrivers = demoPricingData.drivers
  
  // Update demo pricing with the scenario data, but keep the original propId
  const enhancedDemoPricing = {
    ...demoPricing,
    propId: bettingLineData?.id || lineData?.propId || demoPricingData.prop, // Use the betting line ID or clicked prop ID
    worthPer1: demoPricingData.ev_per_1,
    pFair: demoPricingData.p_fair,
    fairPrice: demoPricingData.fair_price,
    marketPrice: demoPricingData.market_price,
    mispricing: demoPricingData.mispricing,
    evPer1: demoPricingData.ev_per_1,
    thetaPer30s: demoPricingData.theta_per_30s,
    band: demoPricingData.band,
    fairOdds: demoPricingData.fair_odds,
    onExplain: () => setShowExplain(true),
  }

  // Format prop name for display using dynamic data
  const formatPropName = (propId: string) => {
    // If we have betting line data, use it for display
    if (bettingLineData) {
      const playerName = bettingLineData.player_name || bettingLineData.player || 'Player'
      const propType = bettingLineData.prop_type || bettingLineData.prop || 'prop'
      const line = bettingLineData.line || 0
      const direction = bettingLineData.over_under || bettingLineData.betType || 'over'
      
      // Format the prop type for display
      const propTypeMap: { [key: string]: string } = {
        'pass_yards': 'Pass Yards',
        'rush_yards': 'Rush Yards',
        'receptions': 'Receptions',
        'pass_tds': 'Pass TDs',
        'rush_tds': 'Rush TDs',
        'receiving_tds': 'Rec TDs',
        'pass_completions': 'Pass Comp',
        'pass_attempts': 'Pass Att',
        'interceptions': 'INT',
        'fumbles': 'FUM',
        'total_touchdowns': 'Total TD',
        'PASS_YDS': 'Pass Yards',
        'RUSH_YDS': 'Rush Yards',
        'REC': 'Receptions',
        'PASS_TD': 'Pass TDs',
        'RUSH_TD': 'Rush TDs',
        'REC_YDS': 'Rec Yards'
      }
      
      const displayPropType = propTypeMap[propType] || propType
      const displayDirection = direction === 'over' ? 'o' : 'u'
      
      return `${playerName}\n${displayPropType} ${displayDirection} ${line}`
    }
    
    // Fallback to parsing propId if no betting data
    const parts = propId.split('_')
    if (parts.length >= 4) {
      const propType = parts[0] // AST, PTS, REB, etc.
      const direction = parts[1] // over/under
      const line = parts[2] // 7.5, 25.5, etc.
      const playerId = parts[3] // player123, player456, etc.
      
      // Map player IDs to actual names
      const playerNames: { [key: string]: string } = {
        'beck': 'Carson Beck',
        'milroe': 'Jalen Milroe',
        'milton': 'Kendall Milton',
        'smith': 'Arian Smith',
        'williams': 'Ryan Williams',
        'haynes': 'Justice Haynes',
        'haynes_king': 'Haynes King',
        'player123': 'Carson Beck',
        'player456': 'Kendall Milton', 
        'player789': 'Arian Smith'
      }
      
      const playerName = playerNames[playerId] || playerId.replace('player', 'Player ')
      
      // Format the prop type for display
      const propTypeMap: { [key: string]: string } = {
        'PASS_YDS': 'Pass Yards',
        'RUSH_YDS': 'Rush Yards',
        'REC': 'Receptions',
        'PASS_TD': 'Pass TDs',
        'RUSH_TD': 'Rush TDs',
        'REC_YDS': 'Rec Yards'
      }
      
      const displayPropType = propTypeMap[propType] || propType
      const displayDirection = direction === 'over' ? 'o' : 'u'
      
      return `${playerName}\n${displayPropType} ${displayDirection} ${line}`
    }
    return propId
  }

  // Generate AI report based on the actual prop type and dynamic data
  const generateAIReport = (propType: string) => {
    console.log('LiveScreen: generateAIReport called with propType:', propType)
    console.log('LiveScreen: bettingLineData available:', !!bettingLineData)
    
    // Use dynamic data if available
    if (bettingLineData) {
      console.log('LiveScreen: Using dynamic data for AI report')
      console.log('LiveScreen: bettingLineData.analysis:', bettingLineData.analysis)
      console.log('LiveScreen: liveReasoning:', liveReasoning)
      
      return {
        liveReasoning: liveReasoning || "Live analysis based on current game events and player performance.",
        historicalReasoning: bettingLineData.analysis || "Historical analysis unavailable - no analysis data from betting lines."
      }
    }
    
    console.log('LiveScreen: Using fallback static data for AI report')
    
    // Fallback to static reports based on prop type
    const reports = {
      'pass_yards': {
        liveReasoning: "Current passing pace and completion rate analysis based on live game data.",
        historicalReasoning: "Historical passing yards performance against similar defenses and weather conditions."
      },
      'rush_yards': {
        liveReasoning: "Current rushing attempts and efficiency based on live game flow.",
        historicalReasoning: "Historical rushing performance against this opponent's defensive scheme."
      },
      'pass_completions': {
        liveReasoning: "Live completion percentage and target distribution analysis.",
        historicalReasoning: "Historical completion rates against similar defensive coverages."
      },
      'pass_tds': {
        liveReasoning: "Red zone opportunities and passing touchdown probability based on current game situation.",
        historicalReasoning: "Historical touchdown pass frequency in similar game situations."
      },
      'interceptions': {
        liveReasoning: "Current interception risk based on defensive pressure and passing accuracy.",
        historicalReasoning: "Historical interception rates against this opponent's defensive scheme."
      },
      'PRA': {
        liveReasoning: "Current pace at 103.2 possessions (+4% vs season avg), player usage rate 28.3% (+4.2% vs baseline), hot hand effect with 67% FG in Q3.",
        historicalReasoning: "Player hits PRA over 42.5 in 68% of similar matchups. Opponent allows +12% PRA vs season average. Last 5 games: 4/5 overs."
      },
      'AST': {
        liveReasoning: "Teammate shooting efficiency at 58.3% (+12% vs season avg), current pace 103.2 possessions, defensive pressure on passing lanes moderate.",
        historicalReasoning: "Player averages 8.2 assists vs this opponent. Team assists +15% in last 3 games. Opponent allows 7th most assists in league."
      },
      'PTS': {
        liveReasoning: "Hot hand effect with 67% FG over last 8 minutes, usage rate 28.3% (+4.2% vs baseline), current pace 103.2 possessions.",
        historicalReasoning: "Player scores 25+ in 72% of home games. Opponent allows 4th most points to guards. Last 5 meetings: 4/5 overs."
      },
      'REB': {
        liveReasoning: "Team shooting efficiency creating missed shot opportunities, current pace 103.2 possessions, opponent rebounding pressure moderate.",
        historicalReasoning: "Player averages 11.8 rebounds vs this opponent. Team rebounds +8% in last 3 games. Opponent allows 6th most rebounds."
      }
    }
    
    return reports[propType as keyof typeof reports] || reports['pass_yards']
  }

  // Get the prop type from the clicked prop or betting data
  const propType = bettingLineData?.prop_type || lineData?.propId?.split('_')[0] || 'PASS_YDS'
  const aiReport = generateAIReport(propType)

  // Generate realistic chart data based on prop type and player
  const generateChartData = (propType: string, playerName: string): ChartPoint[] => {
    const baseData: { [key: string]: ChartPoint[] } = {
      'PASS_YDS': [
        { time: "Q1 15:00", percentage: 68, ev: 0.12, confidence: 0.85, factors: ["Opening drive", "Season average"], currentTotal: 0, targetLine: 275.5, type: 'peak', insight: "Strong opening value with 12% edge", gameEvent: "Game starts" },
        { time: "Q1 12:30", percentage: 72, ev: 0.18, confidence: 0.92, factors: ["Hot start", "Fast pace"], currentTotal: 45, targetLine: 275.5, type: 'peak', insight: "Excellent value - 18% edge after hot start", gameEvent: "45 yards on opening drive" },
        { time: "Q1 8:15", percentage: 65, ev: 0.08, confidence: 0.45, factors: ["Defensive pressure"], currentTotal: 78, targetLine: 275.5, type: 'normal', insight: "Reduced value due to pressure", gameEvent: "Sack - 8 yard loss" },
        { time: "Q2 14:00", percentage: 58, ev: -0.05, confidence: 0.78, factors: ["Run-heavy script"], currentTotal: 78, targetLine: 275.5, type: 'trough', insight: "Negative EV - avoid betting", gameEvent: "3 straight runs" },
        { time: "Q2 10:45", percentage: 52, ev: -0.12, confidence: 0.82, factors: ["Cold streak", "Interception"], currentTotal: 95, targetLine: 275.5, type: 'trough', insight: "Poor value - turnover", gameEvent: "Interception returned" },
        { time: "Q2 6:30", percentage: 61, ev: 0.06, confidence: 0.65, factors: ["Momentum shift"], currentTotal: 125, targetLine: 275.5, type: 'normal', insight: "Moderate value - heating up", gameEvent: "25-yard completion" },
        { time: "Q3 11:20", percentage: 55, ev: 0.02, confidence: 0.58, factors: ["Defensive adjustment"], currentTotal: 145, targetLine: 275.5, type: 'normal', insight: "Neutral value - monitor closely", gameEvent: "20-yard pass" },
        { time: "Q3 7:10", percentage: 48, ev: -0.15, confidence: 0.88, factors: ["Defensive pressure", "Limited time"], currentTotal: 165, targetLine: 275.5, type: 'trough', insight: "Avoid - pressure limiting upside", gameEvent: "Another sack" },
        { time: "Q4 12:15", percentage: 62, ev: 0.15, confidence: 0.91, factors: ["Crunch time", "Passing down"], currentTotal: 220, targetLine: 275.5, type: 'peak', insight: "Great value - crunch time opportunity", gameEvent: "35-yard completion" },
        { time: "Q4 8:30", percentage: 58, ev: 0.08, confidence: 0.72, factors: ["Final push"], currentTotal: 245, targetLine: 275.5, type: 'normal', insight: "Good value - final minutes", gameEvent: "25-yard pass" }
      ],
      'RUSH_YDS': [
        { time: "Q1 15:00", percentage: 65, ev: 0.10, confidence: 0.80, factors: ["Opening drive"], currentTotal: 0, targetLine: 85.5, type: 'peak', insight: "Good opening value", gameEvent: "Game starts" },
        { time: "Q1 12:45", percentage: 72, ev: 0.15, confidence: 0.90, factors: ["Hot start"], currentTotal: 12, targetLine: 85.5, type: 'peak', insight: "Excellent value - hot start", gameEvent: "12 yards on 2 carries" },
        { time: "Q1 9:20", percentage: 68, ev: 0.12, confidence: 0.85, factors: ["Steady rate"], currentTotal: 18, targetLine: 85.5, type: 'normal', insight: "Good value - steady rate", gameEvent: "6-yard run" },
        { time: "Q2 14:00", percentage: 55, ev: -0.05, confidence: 0.70, factors: ["Passing down"], currentTotal: 18, targetLine: 85.5, type: 'trough', insight: "Reduced value - passing down", gameEvent: "3rd and long" },
        { time: "Q2 7:30", percentage: 48, ev: -0.12, confidence: 0.75, factors: ["Defensive pressure"], currentTotal: 22, targetLine: 85.5, type: 'trough', insight: "Poor value - defensive pressure", gameEvent: "Tackle for loss" },
        { time: "Q2 3:45", percentage: 58, ev: 0.05, confidence: 0.65, factors: ["Momentum"], currentTotal: 28, targetLine: 85.5, type: 'normal', insight: "Moderate value - heating up", gameEvent: "6-yard run" },
        { time: "Q3 8:00", percentage: 52, ev: 0.02, confidence: 0.60, factors: ["Steady play"], currentTotal: 35, targetLine: 85.5, type: 'normal', insight: "Neutral value", gameEvent: "7 yards on 2 carries" },
        { time: "Q3 4:30", percentage: 45, ev: -0.08, confidence: 0.80, factors: ["Defensive pressure"], currentTotal: 38, targetLine: 85.5, type: 'trough', insight: "Avoid - defensive pressure", gameEvent: "Stuffed at line" },
        { time: "Q4 8:45", percentage: 62, ev: 0.08, confidence: 0.75, factors: ["Crunch time"], currentTotal: 52, targetLine: 85.5, type: 'normal', insight: "Good value - crunch time", gameEvent: "14-yard run" },
        { time: "Q4 4:20", percentage: 58, ev: 0.05, confidence: 0.70, factors: ["Final push"], currentTotal: 67, targetLine: 85.5, type: 'normal', insight: "Moderate value - final push", gameEvent: "15-yard run" }
      ],
      'REC_YDS': [
        { time: "Q1 15:00", percentage: 72, type: 'peak', insight: "Opening line for receiving yards", gameEvent: "Game starts" },
        { time: "Q1 12:30", percentage: 78, type: 'peak', insight: "Hot start", gameEvent: "18-yard reception" },
        { time: "Q1 9:15", percentage: 75, type: 'normal', insight: "Good rhythm", gameEvent: "12-yard catch" },
        { time: "Q2 14:00", percentage: 68, type: 'normal', insight: "Steady receiving", gameEvent: "8-yard catch" },
        { time: "Q2 11:20", percentage: 58, type: 'trough', insight: "Cold stretch", gameEvent: "Dropped pass" },
        { time: "Q2 7:45", percentage: 65, type: 'normal', insight: "Getting back in rhythm", gameEvent: "15-yard reception" },
        { time: "Q3 12:00", percentage: 62, type: 'normal', insight: "Moderate receiving", gameEvent: "6-yard catch" },
        { time: "Q3 8:30", percentage: 55, type: 'trough', insight: "Defensive pressure", gameEvent: "Coverage tight" },
        { time: "Q4 10:20", percentage: 68, type: 'normal', insight: "Crunch time receiving", gameEvent: "22-yard catch" },
        { time: "Q4 6:45", percentage: 65, type: 'normal', insight: "Current fair value", gameEvent: "Recent 9-yard catch" }
      ],
      'PASS_TD': [
        { time: "Q1 15:00", percentage: 58, type: 'peak', insight: "Opening line for passing TDs", gameEvent: "Game starts" },
        { time: "Q1 12:30", percentage: 65, type: 'peak', insight: "Red zone opportunity", gameEvent: "Inside 20-yard line" },
        { time: "Q1 9:45", percentage: 62, type: 'normal', insight: "Good field position", gameEvent: "At 15-yard line" },
        { time: "Q2 13:30", percentage: 55, type: 'normal', insight: "Moderate opportunity", gameEvent: "At 25-yard line" },
        { time: "Q2 10:15", percentage: 48, type: 'trough', insight: "Defensive pressure", gameEvent: "Sacked in red zone" },
        { time: "Q2 6:20", percentage: 58, type: 'normal', insight: "Getting back in position", gameEvent: "Inside 10-yard line" },
        { time: "Q3 11:45", percentage: 52, type: 'normal', insight: "Steady opportunity", gameEvent: "At 12-yard line" },
        { time: "Q3 8:10", percentage: 45, type: 'trough', insight: "Defensive pressure limiting", gameEvent: "Interception in end zone" },
        { time: "Q4 9:30", percentage: 62, type: 'normal', insight: "Crunch time opportunity", gameEvent: "Inside 5-yard line" },
        { time: "Q4 5:15", percentage: 58, type: 'normal', insight: "Current fair value", gameEvent: "At 8-yard line" }
      ]
    }
    
    return baseData[propType as keyof typeof baseData] || baseData['PASS_YDS']
  }

  // Generate chart data with events from betting line data
  const generateChartDataWithEvents = (propType: string, playerName: string, events?: string): ChartPoint[] => {
    const baseData = generateChartData(propType, playerName)
    
    // If we have events data, modify some chart points to reflect the events
    if (events && bettingLineData) {
      // Parse events - they might be separated by periods or be a single statement
      let eventsList: string[] = []
      
      // Try different parsing methods
      if (events.includes('.')) {
        eventsList = events.split('.').filter(e => e.trim().length > 0)
      } else if (events.includes(',')) {
        eventsList = events.split(',').filter(e => e.trim().length > 0)
      } else {
        // Single event statement
        eventsList = [events.trim()]
      }
      
      // Create enhanced chart data with real events
      const enhancedData = baseData.map((point, index) => {
        let gameEvent = point.gameEvent || ''
        let insight = point.insight || ''
        
        // Add real events to the first few chart points
        if (index < eventsList.length && eventsList[index]) {
          const eventText = eventsList[index].trim()
          gameEvent = eventText
          insight = `Live: ${eventText}`
        } else if (index >= eventsList.length) {
          // Use mock data for remaining points if we don't have enough real events
          gameEvent = point.gameEvent || `Mock event ${index + 1}`
          insight = point.insight || `Simulated game event ${index + 1}`
        }
        
        return {
          ...point,
          gameEvent,
          insight
        }
      })
      
      return enhancedData
    }
    
    return baseData
  }

  const chartData = generateChartDataWithEvents(
    propType, 
    bettingLineData?.player_name || lineData?.propId || '',
    bettingLineData?.events
  )

  const demoMoments = [
    { id: "1", time: "8:14 Q4", description: "Pace spike detected" },
    { id: "2", time: "7:45 Q4", description: "2 live-ball TOs/90s" },
    { id: "3", time: "7:20 Q4", description: "Starter re-entered" },
  ]


  // Show loading state while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading prop analysis...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>

      {/* Alert Banner */}
      {showAlert && alertData && (
        <AlertBanner
          title={alertData.title}
          subtitle={alertData.subtitle}
          onView={() => {
            hideAlert()
            console.log("View alert details")
          }}
          onSnooze={() => {
            hideAlert()
            console.log("Snoozed for 10 minutes")
          }}
        />
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Prop Name at Top */}
        <SlideInView delay={0} direction="down" duration={600}>
          <View style={styles.propNameContainer}>
            <Text style={styles.propName}>{formatPropName(enhancedDemoPricing.propId)}</Text>
          </View>
        </SlideInView>


        {/* AI Report */}
        <FadeInView delay={300} duration={800}>
          <AIReport 
            propName={formatPropName(enhancedDemoPricing.propId)}
            report={aiReport}
            loading={geminiLoading}
          />
        </FadeInView>

        {/* Expected Value Chart */}
        <ShadcnLineChart 
          data={chartData}
          onPointPress={setSelectedChartPoint}
          selectedPoint={selectedChartPoint}
          title="Expected Value vs Time"
          description="Green = Good bet, Red = Avoid, Yellow = Neutral"
          touchSize={100}
        />
        
        {/* Transparency Tab at Bottom */}
        <TouchableOpacity 
          style={styles.transparencyTab}
          onPress={() => navigation.navigate("Transparency", { lineId, lineData })}
        >
          <BarChart3 size={20} color={colors.primary} />
          <Text style={styles.transparencyTabText}>View Transparency</Text>
        </TouchableOpacity>

        {/* View Conversation */}
        <TouchableOpacity 
          style={[styles.transparencyTab, styles.conversationButton]}
          onPress={() => navigation.navigate("Main", {
            screen: 'Chats',
            params: { targetPropId: lineData?.propId || lineId, ensureCreate: true }
          })}
        >
          <BarChart3 size={20} color={colors.primary} />
          <Text style={styles.transparencyTabText}>View Conversation</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Explain Drawer */}
      <ExplainDrawer
        visible={showExplain}
        onClose={() => setShowExplain(false)}
        drivers={demoDrivers}
        band={demoPricingData.band}
        brier={0.19}
        windows={{ paceMin: 4, minutesMin: 8 }}
        lastUpdate="Q4 8:14"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  propNameContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  propName: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.text,
    textAlign: "center",
  },
  transparencyTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  marginVertical: 16,
  marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  transparencyTabText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.primary,
    marginLeft: 8,
  },
  conversationButton: {
    marginBottom: 96, 
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: typography.lg,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  }
})
