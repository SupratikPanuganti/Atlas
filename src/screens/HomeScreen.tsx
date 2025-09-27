"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { MainTabParamList, RootStackParamList } from "../types/navigation"
import { FadeInView, SlideInView, PressableCard } from "../components/animations"

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>

const { width } = Dimensions.get("window")

type TabType = 'active' | 'history'

export default function HomeScreen() {
  const { 
    user, 
    bets, 
    bettingStats, 
    setBets, 
    setBettingStats, 
    calculateBettingStats 
  } = useAppStore()
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [activeTab, setActiveTab] = useState<TabType>('active')

  // Load demo betting data on component mount
  useEffect(() => {
    const demoBets = demoService.generateDemoBets()
    const demoStats = demoService.generateDemoBettingStats()
    
    setBets(demoBets)
    setBettingStats(demoStats)
  }, [setBets, setBettingStats])

  const handleViewBet = (bet: any) => {
    // Navigate to bet details or live screen
    console.log("View bet:", bet.id)
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
                Betting Dashboard
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
              <Play size={20} color={activeTab === 'active' ? colors.primary : colors.muted} />
              <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                Active Bets
              </Text>
            </PressableCard>
            
            <PressableCard
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <History size={20} color={activeTab === 'history' ? colors.primary : colors.muted} />
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                Bet History
              </Text>
            </PressableCard>
          </View>
        </SlideInView>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'active' ? (
            <ActiveBets bets={bets} onViewBet={handleViewBet} />
          ) : (
            <BetHistory bets={bets} onViewBet={handleViewBet} />
          )}
        </View>


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
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary + "20",
  },
  tabText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.muted,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  tabContent: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bottomSpacing: {
    height: 100,
  },
})