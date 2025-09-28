"use client"

import { useState, useMemo } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search, ChevronDown } from "lucide-react-native"
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
  const [selectedSport, setSelectedSport] = useState<"NCAA" | "NFL">("NCAA")
  const [selectedPropTypes, setSelectedPropTypes] = useState<string[]>(["PASS_YDS", "RUSH_YDS", "REC"])
  const [selectedDeltaSign, setSelectedDeltaSign] = useState<"both" | "positive" | "negative">("both")
  const [minDelta, setMinDelta] = useState(0.5)
  const [linesTab, setLinesTab] = useState<"today" | "suggestions">("today")
  const [showSportDropdown, setShowSportDropdown] = useState(false)

  // Demo data - NCAA and NFL Football props
  const demoRadarItems: RadarItem[] = [
    // NCAA Football props
    {
      propId: "RUSH_YDS_over_125.5_milton",
      label: "Kendall Milton Rush Yds 125.5 o",
      deltaVsMedian: 1.5,
      staleMin: 4,
      sport: "NCAA"
    },
    {
      propId: "PASS_YDS_over_275.5_beck",
      label: "Carson Beck Pass Yds 275.5 o",
      deltaVsMedian: 1.0,
      staleMin: 3,
      sport: "NCAA"
    },
    {
      propId: "PASS_YDS_over_280.5_milroe",
      label: "Jalen Milroe Pass Yds 280.5 o",
      deltaVsMedian: 2.1,
      staleMin: 6,
      sport: "NCAA"
    },
    {
      propId: "REC_over_5.5_smith",
      label: "Arian Smith Receptions 5.5 o",
      deltaVsMedian: 0.8,
      staleMin: 2,
      sport: "NCAA"
    },
    {
      propId: "REC_over_6.5_williams",
      label: "Ryan Williams Receptions 6.5 o",
      deltaVsMedian: 1.8,
      staleMin: 5,
      sport: "NCAA"
    },
    {
      propId: "RUSH_YDS_over_85.5_haynes",
      label: "Justice Haynes Rush Yds 85.5 o",
      deltaVsMedian: 1.2,
      staleMin: 3,
      sport: "NCAA"
    },
    // NFL Football props
    {
      propId: "PASS_YDS_over_285.5_allen",
      label: "Josh Allen Pass Yds 285.5 o",
      deltaVsMedian: 1.3,
      staleMin: 2,
      sport: "NFL"
    },
    {
      propId: "RUSH_YDS_over_95.5_henry",
      label: "Derrick Henry Rush Yds 95.5 o",
      deltaVsMedian: 0.9,
      staleMin: 4,
      sport: "NFL"
    },
    {
      propId: "REC_over_7.5_kelce",
      label: "Travis Kelce Receptions 7.5 o",
      deltaVsMedian: 1.6,
      staleMin: 1,
      sport: "NFL"
    },
    {
      propId: "PASS_TD_over_2.5_mahomes",
      label: "Patrick Mahomes Pass TDs 2.5 o",
      deltaVsMedian: 1.4,
      staleMin: 3,
      sport: "NFL"
    },
  ]

  const filteredItems = useMemo(() => {
    const base = radarItems.length > 0 ? radarItems : demoRadarItems
    const items = linesTab === "today" ? base : base.filter(i => i.deltaVsMedian >= 1.0)

    const filtered = items.filter((item) => {
      // Filter by sport
      if (item.sport && item.sport !== selectedSport) {
        return false
      }

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
  }, [radarItems, demoRadarItems, selectedPropTypes, selectedDeltaSign, linesTab, selectedSport])

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

  const handleSportSelect = (sport: "NCAA" | "NFL") => {
    setSelectedSport(sport)
    setShowSportDropdown(false)
  }

  const renderHeader = () => (
    <View style={styles.contentHeader}>
      <Text style={styles.sectionTitle}>Today's Line Radar</Text>
      <View style={styles.headerBottom}>
        <Text style={styles.sectionDescription}>
          {filteredItems.length} line{filteredItems.length !== 1 ? "s" : ""} detected
        </Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity 
            style={styles.sportDropdown} 
            activeOpacity={0.8}
            onPress={() => setShowSportDropdown(!showSportDropdown)}
          >
            <Text style={styles.sportDropdownText}>{selectedSport}</Text>
            <ChevronDown size={16} color={colors.muted} />
          </TouchableOpacity>
          {showSportDropdown && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity 
                style={[styles.dropdownOption, selectedSport === 'NCAA' && styles.dropdownOptionActive]}
                onPress={() => handleSportSelect('NCAA')}
              >
                <Text style={[styles.dropdownOptionText, selectedSport === 'NCAA' && styles.dropdownOptionTextActive]}>
                  NCAA
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dropdownOption, selectedSport === 'NFL' && styles.dropdownOptionActive]}
                onPress={() => handleSportSelect('NFL')}
              >
                <Text style={[styles.dropdownOptionText, selectedSport === 'NFL' && styles.dropdownOptionTextActive]}>
                  NFL
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
            <View style={styles.filtersContainer}>
              <RadarFilters
                selectedPropTypes={selectedPropTypes}
                selectedDeltaSign={selectedDeltaSign}
                onPropTypeToggle={handlePropTypeToggle}
                onDeltaSignChange={setSelectedDeltaSign}
              />
            </View>
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sportDropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  sportDropdownText: {
    fontSize: typography.sm,
    color: colors.muted,
    fontWeight: typography.medium,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted,
    width: 80,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dropdownOptionActive: {
    backgroundColor: colors.primary + '10',
  },
  dropdownOptionText: {
    fontSize: typography.sm,
    color: colors.text,
    fontWeight: typography.medium,
  },
  dropdownOptionTextActive: {
    color: colors.primary,
    fontWeight: typography.semibold,
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
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 6,
    overflow: "hidden",
  },
  selectorTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 48,
  },
  selectorTabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorText: {
    fontSize: typography.sm,
    color: colors.muted,
    fontWeight: typography.medium,
    textAlign: "center",
  },
  selectorTextActive: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
})
