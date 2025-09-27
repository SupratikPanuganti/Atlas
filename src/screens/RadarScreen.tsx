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
  const [selectedSport, setSelectedSport] = useState("NCAAF")
  const [selectedPropTypes, setSelectedPropTypes] = useState<string[]>(["PASS_YDS", "RUSH_YDS", "REC"])
  const [selectedDeltaSign, setSelectedDeltaSign] = useState<"both" | "positive" | "negative">("both")
  const [minDelta, setMinDelta] = useState(0.5)
  const [linesTab, setLinesTab] = useState<"today" | "suggestions">("today")

  // Demo data - Georgia vs Alabama NCAA Football props

  const demoRadarItems: RadarItem[] = [
    {
      propId: "RUSH_YDS_over_125.5_milton",
      label: "Kendall Milton Rush Yds 125.5 o",
      deltaVsMedian: 1.5,
      staleMin: 4,
    },
    {
      propId: "PASS_YDS_over_275.5_beck",
      label: "Carson Beck Pass Yds 275.5 o",
      deltaVsMedian: 1.0,
      staleMin: 3,
    },
    {
      propId: "PASS_YDS_over_280.5_milroe",
      label: "Jalen Milroe Pass Yds 280.5 o",
      deltaVsMedian: 2.1,
      staleMin: 6,
    },
    {
      propId: "REC_over_5.5_smith",
      label: "Arian Smith Receptions 5.5 o",
      deltaVsMedian: 0.8,
      staleMin: 2,
    },
    {
      propId: "REC_over_6.5_williams",
      label: "Ryan Williams Receptions 6.5 o",
      deltaVsMedian: 1.8,
      staleMin: 5,
    },
    {
      propId: "RUSH_YDS_over_85.5_haynes",
      label: "Justice Haynes Rush Yds 85.5 o",
      deltaVsMedian: 1.2,
      staleMin: 3,
    },
  ]

  const filteredItems = useMemo(() => {
    const base = radarItems.length > 0 ? radarItems : demoRadarItems
    const items = linesTab === "today" ? base : base.filter(i => i.deltaVsMedian >= 1.0)

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
  }, [radarItems, demoRadarItems, selectedPropTypes, selectedDeltaSign, linesTab])

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
      <Text style={styles.emptyTitle}>No lines detected today</Text>
      <Text style={styles.emptySubtitle}>We'll ping you if one lags behind the market</Text>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Today's Line Radar</Text>
      <View style={styles.headerRight}>
        <Text style={styles.subtitle}>
          {filteredItems.length} line{filteredItems.length !== 1 ? "s" : ""} detected
        </Text>
        <TouchableOpacity style={styles.sportDropdown} activeOpacity={0.8}>
          <Text style={styles.sportDropdownText}>{selectedSport === 'NCAAF' ? 'NCAA' : 'NFL'}</Text>
        </TouchableOpacity>
      </View>
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
              selectedPropTypes={selectedPropTypes}
              selectedDeltaSign={selectedDeltaSign}
              onPropTypeToggle={handlePropTypeToggle}
              onDeltaSignChange={setSelectedDeltaSign}
            />
            <View style={styles.selectorContainer}>
              <TouchableOpacity
                style={[styles.selectorTab, linesTab === "today" && styles.selectorTabActive]}
                onPress={() => setLinesTab("today")}
              >
                <Text style={[styles.selectorText, linesTab === "today" && styles.selectorTextActive]}>Today's Lines</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectorTab, linesTab === "suggestions" && styles.selectorTabActive]}
                onPress={() => setLinesTab("suggestions")}
              >
                <Text style={[styles.selectorText, linesTab === "suggestions" && styles.selectorTextActive]}>Our Suggestions</Text>
              </TouchableOpacity>
            </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sportDropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sportDropdownText: {
    fontSize: typography.sm,
    color: colors.muted,
    fontWeight: typography.medium,
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
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  selectorTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectorTabActive: {
    backgroundColor: colors.surface,
  },
  selectorText: {
    fontSize: typography.sm,
    color: colors.muted,
    fontWeight: typography.medium,
  },
  selectorTextActive: {
    color: colors.primary,
  },
})
