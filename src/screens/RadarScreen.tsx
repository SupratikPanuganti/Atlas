"use client"

import { useState, useMemo, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Search, ChevronDown, Activity } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import { RadarRow } from "../components/RadarRow"
import { RadarFilters } from "../components/RadarFilters"
import { useAppStore } from "../store/useAppStore"
import type { RadarItem } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

export default function RadarScreen() {
  const { radarItems, loadRadarItems, refreshRadarItems } = useAppStore()
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSport, setSelectedSport] = useState<"NCAA" | "NFL">("NCAA")
  const [selectedPropTypes, setSelectedPropTypes] = useState<string[]>([]) // Empty = show all
  const [selectedDeltaSign, setSelectedDeltaSign] = useState<"both" | "positive" | "negative">("both")
  // Removed freshness filter
  const [minDelta, setMinDelta] = useState(0.5)
  const [linesTab, setLinesTab] = useState<"today" | "suggestions">("today")
  const [showSportDropdown, setShowSportDropdown] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  // Load radar items on component mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('RadarScreen: Starting to load data...')
        await loadRadarItems(selectedSport, linesTab, selectedPropTypes, selectedDeltaSign)
        console.log('RadarScreen: Data loading completed')
      } catch (error) {
        console.error('Error loading radar items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedSport, linesTab, selectedPropTypes, selectedDeltaSign, loadRadarItems])

  // Set up automatic refresh for NCAA lines (more frequent) vs NFL lines
  useEffect(() => {
    const refreshInterval = selectedSport === 'NCAA' ? 15000 : 30000 // 15s for NCAA, 30s for NFL
    
    const interval = setInterval(() => {
      if (selectedSport === 'NCAA') {
        console.log('🔄 Auto-refreshing NCAA radar items...')
        setLastRefreshTime(new Date())
      }
      refreshRadarItems(selectedSport, linesTab, selectedPropTypes, selectedDeltaSign)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshRadarItems, selectedSport, linesTab, selectedPropTypes, selectedDeltaSign])

  // No hardcoded data - only use database data

  const filteredItems = useMemo(() => {
    // Filtering is now done in the service, so just return the radar items
    console.log('RadarScreen - radarItems:', radarItems.length, radarItems)
    console.log('RadarScreen - Current filters:', {
      selectedSport,
      linesTab,
      selectedPropTypes,
      selectedDeltaSign
    })
    
    if (radarItems.length === 0) {
      console.log('RadarScreen: No database data available')
      return []
    }

    return radarItems
  }, [radarItems, selectedSport, linesTab, selectedPropTypes, selectedDeltaSign])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Use the new refresh method for dynamic updates with current filters
      await refreshRadarItems(selectedSport, linesTab, selectedPropTypes, selectedDeltaSign)
    } catch (error) {
      console.error('Error refreshing radar items:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handlePropTypeToggle = (propType: string) => {
    setSelectedPropTypes((prev) =>
      prev.includes(propType) ? prev.filter((type) => type !== propType) : [...prev, propType],
    )
  }

  // Removed freshness filter handler

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
    // Data will be reloaded by useEffect
  }

  const renderHeader = () => (
    <View style={styles.contentHeader}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Today's Line Radar</Text>
        <View style={styles.liveIndicator}>
          <Activity size={12} color={colors.primary} />
          <Text style={styles.liveText}>
            {selectedSport === 'NCAA' ? 'NCAA LIVE' : 'LIVE'}
          </Text>
          {selectedSport === 'NCAA' && lastRefreshTime && (
            <Text style={styles.refreshTime}>
              {Math.floor((Date.now() - lastRefreshTime.getTime()) / 1000)}s ago
            </Text>
          )}
        </View>
      </View>
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
                onPress={() => {
                  setLinesTab("today")
                  // Data will be reloaded by useEffect
                }}
              >
                <Text style={[styles.selectorText, linesTab === "today" && styles.selectorTextActive]}>Today's Lines</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectorTab, linesTab === "suggestions" && styles.selectorTabActive]}
                onPress={() => {
                  setLinesTab("suggestions")
                  // Data will be reloaded by useEffect
                }}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.text,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  liveText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.success,
  },
  refreshTime: {
    fontSize: typography.xs,
    color: colors.muted,
    marginLeft: 4,
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
