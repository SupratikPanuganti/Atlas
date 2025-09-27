"use client"

import { useState } from "react"
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
import { PercentageChart } from "../components/PercentageChart"
import { useAppStore } from "../store/useAppStore"
import { demoService } from "../services/demoData"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

type LiveScreenRouteProp = RouteProp<RootStackParamList, 'LivePricing'>

export default function LiveScreen() {
  const { currentPricing, showAlert, alertData, hideAlert } = useAppStore()
  const navigation = useNavigation()
  const route = useRoute<LiveScreenRouteProp>()
  const [showExplain, setShowExplain] = useState(false)
  const [selectedChartPoint, setSelectedChartPoint] = useState(null)
  
  // Get route parameters if available
  const lineId = route.params?.lineId
  const lineData = route.params?.lineData

  // Demo data
  const demoPricing = {
    propId: "AST_over_7.5_player123",
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

  // Determine scenario based on the clicked prop or use assists as default
  const getScenarioFromPropId = (propId?: string): 'assists' | 'points' | 'rebounds' => {
    if (!propId) return 'assists'
    
    if (propId.includes('PRA') || propId.includes('AST')) return 'assists'
    if (propId.includes('PTS')) return 'points'
    if (propId.includes('REB')) return 'rebounds'
    
    return 'assists' // default
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
        'jokic': 'Nikola Jokić',
        'lebron': 'LeBron James',
        'embiid': 'Joel Embiid',
        'curry': 'Stephen Curry',
        'haliburton': 'Tyrese Haliburton',
        'sabonis': 'Domantas Sabonis',
        'player123': 'Luka Dončić',
        'player456': 'Stephen Curry', 
        'player789': 'Nikola Jokić'
      }
      
      const playerName = playerNames[playerId] || playerId.replace('player', 'Player ')
      
      // Format the prop type for display
      const propTypeMap: { [key: string]: string } = {
        'AST': 'Assists',
        'PTS': 'Points',
        'REB': 'Rebounds',
        'PRA': 'PRA'
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
        reasoning: "Our model calculates 55.8% fair value for PRA based on live game dynamics. Key factors: current pace of 103.2 possessions (+4% vs season avg), player usage rate at 28.3% (+4.2% vs baseline), and opponent's defensive pressure rating of 7.2/10 affecting all three categories.",
        confidence: "High confidence (0.78) based on 210 similar PRA situations. Model accounts for pace acceleration, hot hand effect (67% FG in Q3), and defensive matchup adjustments across points, rebounds, and assists."
      },
      'AST': {
        reasoning: "Our model calculates 55.8% fair value for assists based on live game dynamics. Key factors: current pace of 103.2 possessions (+4% vs season avg), teammate shooting efficiency at 58.3% (+12% vs season avg), and opponent's perimeter defense creating both challenges and opportunities.",
        confidence: "High confidence (0.78) based on 210 similar assist situations. Model accounts for pace acceleration, teammate efficiency, and defensive pressure on passing lanes."
      },
      'PTS': {
        reasoning: "Our model calculates 55.8% fair value for points based on live game dynamics. Key factors: current pace of 103.2 possessions (+4% vs season avg), player usage rate at 28.3% (+4.2% vs baseline), and hot hand effect with 67% FG over last 8 minutes.",
        confidence: "High confidence (0.78) based on 210 similar scoring situations. Model accounts for pace acceleration, usage rate, hot hand effect, and defensive matchup adjustments."
      },
      'REB': {
        reasoning: "Our model calculates 55.8% fair value for rebounds based on live game dynamics. Key factors: current pace of 103.2 possessions (+4% vs season avg), team shooting efficiency affecting missed shots, and opponent's rebounding tendencies creating opportunities.",
        confidence: "High confidence (0.78) based on 210 similar rebounding situations. Model accounts for pace acceleration, shooting efficiency, and defensive rebounding pressure."
      }
    }
    
    return reports[propType as keyof typeof reports] || reports['AST']
  }

  // Get the prop type from the clicked prop
  const propType = lineData?.propId?.split('_')[0] || 'AST'
  const aiReport = generateAIReport(propType)

  // Generate realistic chart data based on prop type and player
  const generateChartData = (propType: string, playerName: string) => {
    const baseData = {
      'PRA': [
        { time: "Q1 12:00", percentage: 68, type: 'peak', insight: "Opening line based on season averages", gameEvent: "Game starts" },
        { time: "Q1 8:30", percentage: 72, type: 'peak', insight: "Hot start with early points and assists", gameEvent: "Made 3-pointer + assist" },
        { time: "Q1 4:15", percentage: 65, type: 'normal', insight: "Slight dip as pace slows", gameEvent: "2 min dry spell" },
        { time: "Q2 10:00", percentage: 58, type: 'trough', insight: "Bench rotation affects rhythm", gameEvent: "Subbed out" },
        { time: "Q2 6:45", percentage: 52, type: 'trough', insight: "Cold shooting stretch", gameEvent: "0-3 from field" },
        { time: "Q2 2:30", percentage: 61, type: 'normal', insight: "Back in rhythm", gameEvent: "Made layup + rebound" },
        { time: "Q3 8:20", percentage: 55, type: 'normal', insight: "Steady production", gameEvent: "Assist + rebound" },
        { time: "Q3 4:10", percentage: 48, type: 'trough', insight: "Foul trouble limiting aggression", gameEvent: "3rd foul" },
        { time: "Q4 9:15", percentage: 62, type: 'normal', insight: "Crunch time intensity", gameEvent: "Made 3-pointer" },
        { time: "Q4 5:30", percentage: 58, type: 'normal', insight: "Current fair value", gameEvent: "Recent assist" }
      ],
      'AST': [
        { time: "Q1 12:00", percentage: 65, type: 'peak', insight: "Opening line for assists", gameEvent: "Game starts" },
        { time: "Q1 9:45", percentage: 72, type: 'peak', insight: "Great ball movement", gameEvent: "2 assists in 2 min" },
        { time: "Q1 6:20", percentage: 68, type: 'normal', insight: "Steady assist rate", gameEvent: "Another assist" },
        { time: "Q2 11:00", percentage: 55, type: 'trough', insight: "Bench rotation affects flow", gameEvent: "Subbed out" },
        { time: "Q2 7:30", percentage: 48, type: 'trough', insight: "Cold shooting by teammates", gameEvent: "Teammates 0-4" },
        { time: "Q2 3:45", percentage: 58, type: 'normal', insight: "Getting back in rhythm", gameEvent: "Assist on 3-pointer" },
        { time: "Q3 8:00", percentage: 52, type: 'normal', insight: "Moderate assist rate", gameEvent: "1 assist in 4 min" },
        { time: "Q3 4:30", percentage: 45, type: 'trough', insight: "Defensive pressure on passes", gameEvent: "2 turnovers" },
        { time: "Q4 8:45", percentage: 62, type: 'normal', insight: "Crunch time ball movement", gameEvent: "Assist on layup" },
        { time: "Q4 4:20", percentage: 58, type: 'normal', insight: "Current fair value", gameEvent: "Recent assist" }
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
        <View style={styles.propNameContainer}>
          <Text style={styles.propName}>{formatPropName(enhancedDemoPricing.propId)}</Text>
        </View>

        {/* AI Report */}
        <AIReport 
          propName={formatPropName(enhancedDemoPricing.propId)}
          report={aiReport}
        />

        {/* Percentage Chart */}
        <PercentageChart 
          data={chartData}
          onPointPress={setSelectedChartPoint}
          selectedPoint={selectedChartPoint}
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
