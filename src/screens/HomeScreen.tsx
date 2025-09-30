"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { 
  User,
  Play,
  History
} from "lucide-react-native"
import { Card } from "../components/ui/Card"
import { BettingStatsCards } from "../components/BettingStatsCards"
import { ActiveBets } from "../components/ActiveBets"
import { BetHistory } from "../components/BetHistory"
import { useAppStore } from "../store/useAppStore"
import { demoService } from "../services/demoData"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import { useNavigation } from "@react-navigation/native"
import type { CompositeNavigationProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { MainTabParamList, RootStackParamList } from "../types/navigation"
import { FadeInView, SlideInView, PressableCard } from "../components/animations"

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList> & any

const { width } = Dimensions.get("window")

type TabType = 'active' | 'history'

export default function HomeScreen() {
  const { 
    user, 
    bets, 
    bettingStats, 
    loadUserBets,
    loadBettingStats,
    isAuthenticated
  } = useAppStore()
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [loading, setLoading] = useState(true)

  // Load user betting data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true)
          await Promise.all([
            loadUserBets(),
            loadBettingStats()
          ])
        } catch (error) {
          console.error('Error loading betting data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user, loadUserBets, loadBettingStats])

  const handleViewBet = (bet: any) => {
    const propId = `${bet.prop}_${bet.betType === 'over' ? 'over' : 'under'}_${bet.line}_${(bet.player || 'player').toLowerCase().split(' ')[1] || 'player123'}`
    
    // Create lineData object with all the necessary fields for LiveScreen
    const lineData = {
      propId,
      // Include analysis and events from the bet (which comes from betting lines)
      analysis: bet.analysis,
      events: bet.events,
      player_name: bet.player,
      prop_type: bet.prop_type || bet.prop.toLowerCase(),
      over_under: bet.over_under || bet.betType,
      line: bet.line,
      // Include betting line ID for reference
      betting_line_id: bet.betting_line_id,
      // Include other relevant fields
      player: bet.player,
      prop: bet.prop,
      betType: bet.betType
    }
    
    console.log('HomeScreen: Navigating to LiveScreen with lineData:', lineData)
    
    navigation.navigate('LivePricing', {
      lineId: propId,
      lineData,
      stake: bet.stake,
      potential: bet.potentialWin,
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your bets...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <SlideInView delay={0} direction="up" duration={800}>
              <Text style={styles.greeting}>
                Welcome back, {user?.name || "Trader"}!
              </Text>
            </SlideInView>
            <FadeInView delay={400} duration={600}>
              <Text style={styles.subtitle}>
                Dashboard
              </Text>
            </FadeInView>
          </View>
          <PressableCard
            onPress={() => navigation.navigate("Settings")}
            style={styles.settingsButton}
          >
            <User size={24} color={colors.text} />
          </PressableCard>
        </View>

        {/* Betting Statistics */}
        {bettingStats && (
          <FadeInView delay={600} duration={800}>
            <View style={styles.statsContainer}>
              <BettingStatsCards stats={bettingStats} />
            </View>
          </FadeInView>
        )}

        {/* Tabs */}
        <SlideInView delay={800} direction="up" duration={600}>
          <View style={styles.tabsContainer}>
            <PressableCard
              style={[styles.tab, activeTab === 'active' && styles.activeTab]}
              onPress={() => setActiveTab('active')}
            >
              <View style={styles.tabInner}>
                <Play size={18} color={activeTab === 'active' ? colors.primary : colors.muted} />
                <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]} numberOfLines={1}>
                  Active Bets
                </Text>
              </View>
            </PressableCard>
            
            <PressableCard
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <View style={styles.tabInner}>
                <History size={18} color={activeTab === 'history' ? colors.primary : colors.muted} />
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]} numberOfLines={1}>
                  Bet History
                </Text>
              </View>
            </PressableCard>
          </View>
        </SlideInView>

        {/* Tab Content */}
        {activeTab === 'active' ? (
          <ActiveBets bets={bets} onViewBet={handleViewBet} />
        ) : (
          <BetHistory bets={bets} onViewBet={handleViewBet} />
        )}


        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    gap: 6,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  activeTab: {
    backgroundColor: colors.primary + "20",
  },
  tabText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.muted,
    textAlign: "center",
    flexShrink: 0,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  bottomSpacing: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: typography.base,
    color: colors.muted,
    fontWeight: '500',
  },
})