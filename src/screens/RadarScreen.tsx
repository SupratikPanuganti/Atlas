"use client"

import { useState, useMemo } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import { RadarRow } from "../components/RadarRow"
import { RadarFilters } from "../components/RadarFilters"
import { useAppStore } from "../store/useAppStore"
import type { RadarItem } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

export default function RadarScreen() {
  const { radarItems } = useAppStore()
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSport, setSelectedSport] = useState("NBA")
  const [selectedPropTypes, setSelectedPropTypes] = useState<string[]>(["AST", "PRA", "REB"])
  const [selectedDeltaSign, setSelectedDeltaSign] = useState<"both" | "positive" | "negative">("positive")

  //Demo data - more realistic NBA props
  const demoRadarItems: RadarItem[] = [
    {
      propId: "PRA_over_42.5_jokic",
      label: "Nikola Jokic PRA 42.5 o",
      deltaVsMedian: 1.5,
      staleMin: 4,
    },
    {
      propId: "AST_over_7.5_lebron",
      label: "LeBron James AST 7.5 o",
      deltaVsMedian: 1.0,
      staleMin: 3,
    },
    {
      propId: "REB_over_12.5_embiid",
      label: "Joel Embiid REB 12.5 o",
      deltaVsMedian: 2.1,
      staleMin: 6,
    },
    {
      propId: "PTS_over_25.5_curry",
      label: "Stephen Curry PTS 25.5 o",
      deltaVsMedian: 0.8,
      staleMin: 2,
    },
    {
      propId: "AST_over_9.5_haliburton",
      label: "Tyrese Haliburton AST 9.5 o",
      deltaVsMedian: 1.8,
      staleMin: 5,
    },
    {
      propId: "REB_over_10.5_sabonis",
      label: "Domantas Sabonis REB 10.5 o",
      deltaVsMedian: 1.2,
      staleMin: 3,
    },
  ]

  const filteredItems = useMemo(() => {
    const items = radarItems.length > 0 ? radarItems : demoRadarItems

      const filtered = items.filter((item) => {
      // Filter by prop type
      const propType = item.propId.split("_")[0]
      if (selectedPropTypes.length > 0 && !selectedPropTypes.includes(propType)) {
        return false
      }

    // Filter by delta sign grouping
    // Per request: lines with value 1.0 should appear in both groups.
    // Positive lines are those with delta >= 1.0, negative are delta <= 1.0
    if (selectedDeltaSign === "positive" && item.deltaVsMedian < 1.0) return false
    if (selectedDeltaSign === "negative" && item.deltaVsMedian > 1.0) return false

      return true
    })

    // Sort: negatives should be least->greatest, positives greatest->least. "both" defaults to greatest->least.
    if (selectedDeltaSign === "negative") {
      return filtered.sort((a, b) => a.deltaVsMedian - b.deltaVsMedian)
    }

    return filtered.sort((a, b) => b.deltaVsMedian - a.deltaVsMedian)
  }, [radarItems, demoRadarItems, selectedPropTypes, selectedDeltaSign])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handlePropTypeToggle = (propType: string) => {
    setSelectedPropTypes((prev) =>
      prev.includes(propType) ? prev.filter((type) => type !== propType) : [...prev, propType],
    )
  }

  const handleRadarItemPress = (item: RadarItem) => {
    console.log("Radar item pressed:", item)
    // Navigate to Live Pricing screen for this specific line
    navigation.navigate("LivePricing", {
      lineId: item.propId,
      lineData: item
    })
  }

  const renderRadarItem = ({ item }: { item: RadarItem }) => (
    <RadarRow item={item} onPress={handleRadarItemPress} forceSign={selectedDeltaSign} />
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Search size={48} color={colors.muted} />
      <Text style={styles.emptyTitle}>No stale lines now</Text>
      <Text style={styles.emptySubtitle}>We'll ping you if one lags behind the market</Text>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Stale Line Radar</Text>
      <Text style={styles.subtitle}>
        {filteredItems.length} line{filteredItems.length !== 1 ? "s" : ""} detected
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={filteredItems}
        renderItem={renderRadarItem}
        keyExtractor={(item) => item.propId}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <RadarFilters
              selectedSport={selectedSport}
              selectedPropTypes={selectedPropTypes}
              selectedDeltaSign={selectedDeltaSign}
              onSportChange={setSelectedSport}
              onPropTypeToggle={handlePropTypeToggle}
              onDeltaSignChange={setSelectedDeltaSign}
            />
          </>
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: typography.base,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },
})
