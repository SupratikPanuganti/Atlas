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
  
  // Get route parameters if available
  const lineId = route.params?.lineId
  const lineData = route.params?.lineData

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
    propId: lineData?.propId || demoPricingData.prop, // Use the clicked prop ID
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

  // Format prop name for display
  const formatPropName = (propId: string) => {
    // Extract prop type, line, and player from propId like "AST_over_7.5_player123"
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

  // Generate AI report based on the actual prop type
  const generateAIReport = (propType: string) => {
    const reports = {
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
    
    return reports[propType as keyof typeof reports] || reports['AST']
  }

  // Get the prop type from the clicked prop
  const propType = lineData?.propId?.split('_')[0] || 'AST'
  const aiReport = generateAIReport(propType)

  // Generate realistic chart data based on prop type and player
  const generateChartData = (propType: string, playerName: string): ChartPoint[] => {
    const baseData: { [key: string]: ChartPoint[] } = {
      'PRA': [
        { time: "Q1 12:00", percentage: 68, ev: 0.12, confidence: 0.85, factors: ["Opening line", "Season average"], currentTotal: 0, targetLine: 42.5, type: 'peak', insight: "Strong opening value with 12% edge", gameEvent: "Game starts" },
        { time: "Q1 8:30", percentage: 72, ev: 0.18, confidence: 0.92, factors: ["Hot start", "Pace spike"], currentTotal: 6, targetLine: 42.5, type: 'peak', insight: "Excellent value - 18% edge after hot start", gameEvent: "6 PRA in 3 min" },
        { time: "Q1 4:15", percentage: 65, ev: 0.08, confidence: 0.45, factors: ["Bench rotation"], currentTotal: 8, targetLine: 42.5, type: 'normal', insight: "Reduced value due to rotation", gameEvent: "Subbed out - 8 PRA" },
        { time: "Q2 10:00", percentage: 58, ev: -0.05, confidence: 0.78, factors: ["Time pressure", "Bench minutes"], currentTotal: 8, targetLine: 42.5, type: 'trough', insight: "Negative EV - avoid betting", gameEvent: "Bench rotation" },
        { time: "Q2 6:45", percentage: 52, ev: -0.12, confidence: 0.82, factors: ["Cold streak", "Low efficiency"], currentTotal: 10, targetLine: 42.5, type: 'trough', insight: "Poor value - cold shooting", gameEvent: "0-3 from field" },
        { time: "Q2 2:30", percentage: 61, ev: 0.06, confidence: 0.65, factors: ["Momentum shift"], currentTotal: 14, targetLine: 42.5, type: 'normal', insight: "Moderate value - heating up", gameEvent: "Layup + rebound" },
        { time: "Q3 8:20", percentage: 55, ev: 0.02, confidence: 0.58, factors: ["Foul trouble risk"], currentTotal: 18, targetLine: 42.5, type: 'normal', insight: "Neutral value - monitor closely", gameEvent: "Assist + rebound" },
        { time: "Q3 4:10", percentage: 48, ev: -0.15, confidence: 0.88, factors: ["Foul trouble", "Limited minutes"], currentTotal: 20, targetLine: 42.5, type: 'trough', insight: "Avoid - foul trouble limiting upside", gameEvent: "3rd foul" },
        { time: "Q4 9:15", percentage: 62, ev: 0.15, confidence: 0.91, factors: ["Crunch time", "High usage"], currentTotal: 30, targetLine: 42.5, type: 'peak', insight: "Great value - crunch time opportunity", gameEvent: "Made 3-pointer" },
        { time: "Q4 5:30", percentage: 58, ev: 0.08, confidence: 0.72, factors: ["Final push"], currentTotal: 38, targetLine: 42.5, type: 'normal', insight: "Good value - final minutes", gameEvent: "Recent assist" }
      ],
      'AST': [
        { time: "Q1 12:00", percentage: 65, ev: 0.10, confidence: 0.80, factors: ["Opening line"], currentTotal: 0, targetLine: 7.5, type: 'peak', insight: "Good opening value", gameEvent: "Game starts" },
        { time: "Q1 9:45", percentage: 72, ev: 0.15, confidence: 0.90, factors: ["Hot start"], currentTotal: 2, targetLine: 7.5, type: 'peak', insight: "Excellent value - hot start", gameEvent: "2 assists in 2 min" },
        { time: "Q1 6:20", percentage: 68, ev: 0.12, confidence: 0.85, factors: ["Steady rate"], currentTotal: 3, targetLine: 7.5, type: 'normal', insight: "Good value - steady rate", gameEvent: "Another assist" },
        { time: "Q2 11:00", percentage: 55, ev: -0.05, confidence: 0.70, factors: ["Bench rotation"], currentTotal: 3, targetLine: 7.5, type: 'trough', insight: "Reduced value - rotation", gameEvent: "Subbed out" },
        { time: "Q2 7:30", percentage: 48, ev: -0.12, confidence: 0.75, factors: ["Cold teammates"], currentTotal: 3, targetLine: 7.5, type: 'trough', insight: "Poor value - cold teammates", gameEvent: "Teammates 0-4" },
        { time: "Q2 3:45", percentage: 58, ev: 0.05, confidence: 0.65, factors: ["Momentum"], currentTotal: 4, targetLine: 7.5, type: 'normal', insight: "Moderate value - heating up", gameEvent: "Assist on 3-pointer" },
        { time: "Q3 8:00", percentage: 52, ev: 0.02, confidence: 0.60, factors: ["Steady play"], currentTotal: 5, targetLine: 7.5, type: 'normal', insight: "Neutral value", gameEvent: "1 assist in 4 min" },
        { time: "Q3 4:30", percentage: 45, ev: -0.08, confidence: 0.80, factors: ["Defensive pressure"], currentTotal: 5, targetLine: 7.5, type: 'trough', insight: "Avoid - defensive pressure", gameEvent: "2 turnovers" },
        { time: "Q4 8:45", percentage: 62, ev: 0.08, confidence: 0.75, factors: ["Crunch time"], currentTotal: 6, targetLine: 7.5, type: 'normal', insight: "Good value - crunch time", gameEvent: "Assist on layup" },
        { time: "Q4 4:20", percentage: 58, ev: 0.05, confidence: 0.70, factors: ["Final push"], currentTotal: 7, targetLine: 7.5, type: 'normal', insight: "Moderate value - final push", gameEvent: "Recent assist" }
      ],
      'PTS': [
        { time: "Q1 12:00", percentage: 72, type: 'peak', insight: "Opening line for points", gameEvent: "Game starts" },
        { time: "Q1 10:30", percentage: 78, type: 'peak', insight: "Hot shooting start", gameEvent: "Made 3-pointer" },
        { time: "Q1 7:15", percentage: 75, type: 'normal', insight: "Good scoring rhythm", gameEvent: "Made layup" },
        { time: "Q2 11:00", percentage: 68, type: 'normal', insight: "Steady scoring", gameEvent: "Made free throw" },
        { time: "Q2 8:20", percentage: 58, type: 'trough', insight: "Cold shooting stretch", gameEvent: "0-3 from field" },
        { time: "Q2 4:45", percentage: 65, type: 'normal', insight: "Getting back in rhythm", gameEvent: "Made 3-pointer" },
        { time: "Q3 9:00", percentage: 62, type: 'normal', insight: "Moderate scoring", gameEvent: "Made 2-pointer" },
        { time: "Q3 5:30", percentage: 55, type: 'trough', insight: "Defensive pressure", gameEvent: "0-2 from field" },
        { time: "Q4 7:20", percentage: 68, type: 'normal', insight: "Crunch time scoring", gameEvent: "Made 3-pointer" },
        { time: "Q4 3:45", percentage: 65, type: 'normal', insight: "Current fair value", gameEvent: "Recent 2-pointer" }
      ],
      'REB': [
        { time: "Q1 12:00", percentage: 58, type: 'peak', insight: "Opening line for rebounds", gameEvent: "Game starts" },
        { time: "Q1 9:30", percentage: 65, type: 'peak', insight: "Active on boards", gameEvent: "2 rebounds" },
        { time: "Q1 6:45", percentage: 62, type: 'normal', insight: "Good rebounding position", gameEvent: "Defensive rebound" },
        { time: "Q2 10:30", percentage: 55, type: 'normal', insight: "Moderate rebounding", gameEvent: "1 rebound" },
        { time: "Q2 7:15", percentage: 48, type: 'trough', insight: "Opponent making shots", gameEvent: "Few missed shots" },
        { time: "Q2 3:20", percentage: 58, type: 'normal', insight: "Getting back on boards", gameEvent: "Offensive rebound" },
        { time: "Q3 8:45", percentage: 52, type: 'normal', insight: "Steady rebounding", gameEvent: "Defensive rebound" },
        { time: "Q3 5:10", percentage: 45, type: 'trough', insight: "Foul trouble limiting aggression", gameEvent: "3rd foul" },
        { time: "Q4 6:30", percentage: 62, type: 'normal', insight: "Crunch time rebounding", gameEvent: "Key rebound" },
        { time: "Q4 2:15", percentage: 58, type: 'normal', insight: "Current fair value", gameEvent: "Recent rebound" }
      ]
    }
    
    return baseData[propType as keyof typeof baseData] || baseData['PRA']
  }

  const chartData = generateChartData(propType, lineData?.propId || '')

  const demoMoments = [
    { id: "1", time: "8:14 Q4", description: "Pace spike detected" },
    { id: "2", time: "7:45 Q4", description: "2 live-ball TOs/90s" },
    { id: "3", time: "7:20 Q4", description: "Starter re-entered" },
  ]


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
          />
        </FadeInView>

        {/* Expected Value Chart */}
        <ShadcnLineChart 
          data={chartData}
          onPointPress={setSelectedChartPoint}
          selectedPoint={selectedChartPoint}
          title="Expected Value vs Time"
          description="Green = Good bet, Red = Avoid, Yellow = Neutral"
        />
        
        {/* Transparency Tab at Bottom */}
        <TouchableOpacity 
          style={styles.transparencyTab}
          onPress={() => navigation.navigate("Transparency", { lineId, lineData })}
        >
          <BarChart3 size={20} color={colors.primary} />
          <Text style={styles.transparencyTabText}>View Transparency</Text>
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
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  transparencyTabText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.primary,
    marginLeft: 8,
  },
})
