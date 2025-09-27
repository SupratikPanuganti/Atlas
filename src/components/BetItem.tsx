import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye
} from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import type { Bet } from "../types"
import { PressableCard } from "./animations/PressableCard"
import { AnimatedProgressBar } from "./animations/AnimatedProgressBar"

interface BetItemProps {
  bet: Bet
  showCurrentValue?: boolean
  showDate?: boolean
  onViewBet?: (bet: Bet) => void
  variant?: 'active' | 'history'
}

export function BetItem({ bet, showCurrentValue = false, showDate = false, onViewBet, variant = 'history' }: BetItemProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  
  const getBetStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle size={16} color={colors.positive} />
      case 'lost':
        return <XCircle size={16} color={colors.danger} />
      case 'live':
        return <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
          <Text style={styles.statusText}>LIVE</Text>
        </View>
      case 'pending':
        return <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.statusText}>PENDING</Text>
        </View>
      default:
        return null
    }
  }

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return colors.positive
      case 'lost': return colors.danger
      default: return colors.text
    }
  }

  const getTrendIcon = (betType: string) => {
    return betType === 'over' ? (
      <TrendingUp size={14} color={colors.positive} />
    ) : (
      <TrendingDown size={14} color={colors.danger} />
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const calculateProfit = (bet: Bet) => {
    if (bet.status === 'won') {
      return bet.potentialWin - bet.stake
    }
    return -bet.stake
  }

  return (
    <PressableCard
      style={styles.betItem}
      onPress={() => onViewBet?.(bet)}
    >
      <View style={styles.betHeader}>
        <View style={styles.betInfo}>
          <Text style={styles.playerName}>{bet.player}</Text>
          <Text style={styles.propText}>
            {bet.prop} {bet.line} {bet.betType === 'over' ? 'O' : 'U'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.betStatus}>
            {getBetStatusIcon(bet.status)}
          </View>
          <Text style={styles.stakeText}>${bet.stake.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.betDetails}>
        <View style={styles.betStats}>
          {showDate && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Date</Text>
              <Text style={styles.statValue}>{formatDate(bet.placedAt)}</Text>
            </View>
          )}
        </View>

        {bet.liveStats && (
          <View style={styles.liveStats}>
            <View style={styles.liveStat}>
              <Text style={styles.liveStatLabel}>Current: {bet.liveStats.current}</Text>
              <Text style={styles.liveStatLabel}>Projected: {bet.liveStats.projected}</Text>
            </View>
            <AnimatedProgressBar
              progress={Math.min(1, bet.liveStats.current / bet.line)}
              height={6}
              color={bet.liveStats.current >= bet.line ? colors.positive : colors.warning}
              backgroundColor={colors.border}
            />
          </View>
        )}

        <View style={styles.gameInfo}>
          <Text style={styles.gameText}>
            {bet.gameInfo.homeTeam} vs {bet.gameInfo.awayTeam}
          </Text>
          {bet.gameInfo.currentScore && (
            <Text style={styles.scoreText}>{bet.gameInfo.currentScore}</Text>
          )}
          {!bet.gameInfo.currentScore && bet.gameInfo.gameTime && (
            <Text style={styles.timeText}>{bet.gameInfo.gameTime}</Text>
          )}
        </View>
      </View>

      <View style={styles.betActions}>
        {getTrendIcon(bet.betType)}
        <Text style={styles.betTypeText}>OVER {bet.odds.toFixed(2)}</Text>
        {onViewBet && (
          <Eye size={16} color={colors.primary} />
        )}
      </View>
    </PressableCard>
  )
}

const styles = StyleSheet.create({
  betItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  betHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  betInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  propText: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  betStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.xs,
    color: colors.background,
    fontWeight: "600",
  },
  betDetails: {
    marginBottom: 12,
  },
  betStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.muted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.base,
    fontWeight: "600",
    color: colors.text,
  },
  liveStats: {
    marginBottom: 12,
  },
  liveStat: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  liveStatLabel: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  gameInfo: {
    gap: 4,
  },
  gameText: {
    fontSize: typography.xs,
    color: colors.text,
    fontWeight: "500",
  },
  scoreText: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  timeText: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  betActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  betTypeText: {
    fontSize: typography.xs,
    color: colors.muted,
    fontWeight: "500",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  stakeText: {
    marginTop: 6,
    fontSize: typography.base,
    color: colors.text,
    fontWeight: "600",
  },
})
