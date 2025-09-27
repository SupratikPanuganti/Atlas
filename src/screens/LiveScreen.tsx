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

  // Use enhanced demo data from service with random scenario
  const scenarios: ('assists' | 'points' | 'rebounds')[] = ['assists', 'points', 'rebounds']
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
  const demoPricingData = demoService.generateDemoPricing(randomScenario)
  const demoDrivers = demoPricingData.drivers
  
  // Update demo pricing with the scenario data
  const enhancedDemoPricing = {
    ...demoPricing,
    propId: demoPricingData.prop,
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
        
        {/* Price Card */}
        <PriceCard {...enhancedDemoPricing} />

        {/* Transparency Button */}
        <TouchableOpacity 
          style={styles.transparencyButton}
          onPress={() => navigation.navigate("Transparency", { lineId, lineData })}
        >
          <BarChart3 size={20} color={colors.primary} />
          <Text style={styles.transparencyButtonText}>View Transparency</Text>
        </TouchableOpacity>

        {/* Moment Feed */}
        <MomentFeed
          moments={demoMoments}
          onMomentPress={(moment) => {
            console.log("Moment pressed:", moment)
            navigation.navigate("WatchMode", { momentId: moment.id, momentData: moment })
          }}
        />
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
  transparencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  transparencyButtonText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.primary,
    marginLeft: 8,
  },
})
