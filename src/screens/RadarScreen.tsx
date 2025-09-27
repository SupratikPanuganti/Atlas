"use client"

import { useState, useMemo } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search } from "lucide-react-native"
import { RadarRow } from "../components/RadarRow"
import { RadarFilters } from "../components/RadarFilters"
import { useAppStore } from "../store/useAppStore"
import type { RadarItem } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

export default function RadarScreen() {
  const { radarItems } = useAppStore()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSport, setSelectedSport] = useState("NBA")
  const [selectedPropTypes, setSelectedPropTypes] = useState<string[]>(["AST", "PRA", "REB"])
  const [minDelta, setMinDelta] = useState(0.5)

  // Demo data
  const demoRadarItems: RadarItem[] = [
    {
      propId: "PRA_over_42.5_player1",
      label: "Player X PRA 42.5 o",
      deltaVsMedian: 1.5,
      staleMin: 4,
    },
    {
      propId: "AST_over_7.5_player2",
      label: "Player Y AST 7.5 o",
      deltaVsMedian: 1.0,
      staleMin: 3,
    },
    {
      propId: "REB_over_12.5_player3",
      label: "Player Z REB 12.5 o",
      deltaVsMedian: 2.1,
      staleMin: 6,
    },
    {
      propId: "PTS_over_25.5_player4",
      label: "Player A PTS 25.5 o",
      deltaVsMedian: 0.8,
      staleMin: 2,
    },
  ]

  const filteredItems = useMemo(() => {
    const items = radarItems.length > 0 ? radarItems : demoRadarItems

    return items.filter((item) => {
      // Filter by prop type
      const propType = item.propId.split("_")[0]
      if (selectedPropTypes.length > 0 && !selectedPropTypes.includes(propType)) {
        return false
      }

      // Filter by min delta
      if (item.deltaVsMedian < minDelta) {
        return false
      }

      return true
    })
  }, [radarItems, demoRadarItems, selectedPropTypes, minDelta])

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
    // In real app, this would navigate to price card for that prop
  }

  const renderRadarItem = ({ item }: { item: RadarItem }) => <RadarRow item={item} onPress={handleRadarItemPress} />

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Search size={48} color={colors.muted} />
      <Text style={styles.emptyTitle}>No stale lines now</Text>
      <Text style={styles.emptySubtitle}>We'll ping you if one lags behind the market</Text>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Stale Line Radar</Text>
      <Text style={styles.subtitle}>
        {filteredItems.length} line{filteredItems.length !== 1 ? "s" : ""} detected
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
              minDelta={minDelta}
              onSportChange={setSelectedSport}
              onPropTypeToggle={handlePropTypeToggle}
              onMinDeltaChange={setMinDelta}
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
  header: {
    marginBottom: 20,
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
