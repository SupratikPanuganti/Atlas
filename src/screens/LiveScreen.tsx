"use client"

import { useState } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { PriceCard } from "../components/PriceCard"
import { AlertBanner } from "../components/AlertBanner"
import { ExplainDrawer } from "../components/ExplainDrawer"
import { MomentFeed } from "../components/MomentFeed"
import { useAppStore } from "../store/useAppStore"
import { colors } from "../theme/colors"

export default function LiveScreen() {
  const { currentPricing, showAlert, alertData, hideAlert } = useAppStore()

  const [showExplain, setShowExplain] = useState(false)

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
    onSensitivity: () => console.log("Sensitivity pressed"),
  }

  const demoDrivers = [
    { name: "pace" as const, impact: 0.07 },
    { name: "minutes" as const, impact: 0.05 },
    { name: "turnovers" as const, impact: 0.03 },
  ]

  const demoMoments = [
    { id: "1", time: "8:14 Q4", description: "Pace spike detected" },
    { id: "2", time: "7:45 Q4", description: "2 live-ball TOs/90s" },
    { id: "3", time: "7:20 Q4", description: "Starter re-entered" },
  ]

  const handleCounterfactual = (scenario: string) => {
    console.log("Counterfactual:", scenario)
    // In real app, this would update pricing optimistically
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        <PriceCard {...(currentPricing || demoPricing)} />

        {/* Moment Feed */}
        <MomentFeed
          moments={demoMoments}
          onMomentPress={(moment) => {
            console.log("Moment pressed:", moment)
            setShowExplain(true)
          }}
        />
      </ScrollView>

      {/* Explain Drawer */}
      <ExplainDrawer
        visible={showExplain}
        onClose={() => setShowExplain(false)}
        drivers={demoDrivers}
        band={{ lo: 0.52, hi: 0.59 }}
        brier={0.19}
        windows={{ paceMin: 4, minutesMin: 8 }}
        lastUpdate="Q4 8:14"
        onCounterfactual={handleCounterfactual}
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
  },
})
