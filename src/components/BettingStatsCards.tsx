import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Trophy,
  BarChart3
} from "lucide-react-native"
import { Card } from "./ui/Card"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import type { BettingStats } from "../types"
import { PressableCard, FadeInView } from "./animations"

interface BettingStatsCardsProps {
  stats: BettingStats
}

export function BettingStatsCards({ stats }: BettingStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? "+" : ""
    return `${sign}$${Math.abs(amount).toFixed(2)}`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? colors.positive : colors.danger
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp size={16} color={colors.positive} />
    ) : (
      <TrendingDown size={16} color={colors.danger} />
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = colors.text,
    trend,
    delay = 0
  }: {
    title: string
    value: string
    subtitle?: string
    icon: React.ReactNode
    color?: string
    trend?: React.ReactNode
    delay?: number
  }) => (
    <FadeInView delay={delay} duration={800} style={styles.statCardWrapper}>
      <PressableCard style={styles.statCard}>
        <View style={styles.statHeader}>
          {icon}
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && (
          <View style={styles.statSubtitle}>
            {trend}
            <Text style={styles.statSubtitleText}>{subtitle}</Text>
          </View>
        )}
      </PressableCard>
    </FadeInView>
  )

  const totalWins = stats.totalBets > 0 ? Math.round(stats.totalBets * (stats.winRate / 100)) : 0;

  return (
    <View style={styles.container}>
      {/* Main Stats Row - Only 2 Cards */}
      <View style={styles.mainStatsRow}>
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalProfit)}
          icon={<DollarSign size={20} color={colors.primary} />}
          color={colors.positive}
          trend={getTrendIcon(stats.totalProfit)}
          delay={0}
        />
        <StatCard
          title="Total Wins"
          value={totalWins.toString()}
          icon={<Trophy size={20} color={colors.positive} />}
          color={colors.positive}
          trend={stats.currentStreak.type === 'win' ? 
            <Trophy size={16} color={colors.positive} /> : 
            <TrendingDown size={16} color={colors.danger} />
          }
          delay={400}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  mainStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    padding: 16,
    minHeight: 120,
    backgroundColor: colors.card,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: typography.xs,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: typography["2xl"],
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statSubtitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statSubtitleText: {
    fontSize: typography.xs,
    color: colors.muted,
  },
})
