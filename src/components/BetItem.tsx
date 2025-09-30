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
  showDate?: boolean
  onViewBet?: (bet: Bet) => void
}

export function BetItem({ bet, showDate = false, onViewBet }: BetItemProps) {
  const getBetStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle size={16} color={colors.positive} />
      case 'lost':
        return <XCircle size={16} color={colors.danger} />
      case 'pending':
        return <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.statusText}>UPCOMING</Text>
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

  const extractHomeScore = (scoreString: string) => {
    // Extract score from format like "Georgia Tech 21 - Wake Forest 14"
    const match = scoreString.match(/(\w+(?:\s+\w+)*)\s+(\d+)\s+-\s+(\w+(?:\s+\w+)*)\s+(\d+)/)
    return match ? match[2] : '0'
  }

  const extractAwayScore = (scoreString: string) => {
    // Extract score from format like "Georgia Tech 21 - Wake Forest 14"
    const match = scoreString.match(/(\w+(?:\s+\w+)*)\s+(\d+)\s+-\s+(\w+(?:\s+\w+)*)\s+(\d+)/)
    return match ? match[4] : '0'
  }


  return (
    <PressableCard
      style={styles.betItem}
      onPress={() => onViewBet?.(bet)}
    >
      {/* LIVE indicator positioned at top-right corner */}
      {bet.status === 'live' && (
        <View style={styles.liveIndicator}>
          <Text style={styles.liveIndicatorText}>LIVE</Text>
        </View>
      )}
      
      <View style={styles.betHeader}>
        <View style={styles.betInfo}>
          <Text style={styles.playerName}>{bet.player}</Text>
          <Text style={styles.propText}>
            {bet.prop} {bet.line} {bet.betType === 'over' ? 'O' : 'U'}
          </Text>
          {/* Single progress bar showing bet progress */}
          <View style={styles.propProgressContainer}>
            <View style={styles.progressBarWrapper}>
              <AnimatedProgressBar
                progress={
                  bet.status === 'won' ? 1 :
                  bet.status === 'lost' ? 0 :
                  bet.status === 'live' && bet.liveStats ? 
                    Math.min(1, bet.liveStats.current / bet.line) : 
                  0 // 0 for upcoming games
                }
                height={6}
                color={
                  bet.status === 'won' ? colors.positive :
                  bet.status === 'lost' ? colors.danger :
                  bet.status === 'live' && bet.liveStats && bet.liveStats.current >= bet.line ? colors.positive : 
                  bet.status === 'live' ? colors.warning :
                  colors.primary
                }
                backgroundColor={colors.border}
              />
              {/* Goal marker for upcoming games */}
              {bet.status === 'pending' && (
                <View style={[styles.goalMarker, { left: '85%' }]}>
                  <View style={[styles.goalMarkerDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.goalMarkerText}>{bet.line}</Text>
                </View>
              )}
              
              {/* Current line marker for live games */}
              {bet.status === 'live' && bet.liveStats && (
                <View style={[styles.goalMarker, { left: '85%' }]}>
                  <View style={[styles.goalMarkerDot, { backgroundColor: colors.primary }]} />
                  <Text style={styles.goalMarkerText}>{bet.line}</Text>
                </View>
              )}
              
              {/* Current position marker for live games */}
              {bet.status === 'live' && bet.liveStats && (
                <View style={[styles.currentMarker, { left: `${Math.min(85, (bet.liveStats.current / bet.line) * 85)}%` }]}>
                  <View style={[styles.currentMarkerDot, { backgroundColor: colors.warning }]} />
                </View>
              )}
            </View>
            {/* Progress text for live bets */}
            {bet.status === 'live' && bet.liveStats && (
              <Text style={styles.progressText}>
                {bet.liveStats.current} / {bet.line} {bet.betType === 'over' ? '(need +' + (bet.line - bet.liveStats.current).toFixed(1) + ')' : '(need -' + (bet.liveStats.current - bet.line).toFixed(1) + ')'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.betStatus}>
          {getBetStatusIcon(bet.status)}
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

        {bet.status === 'live' && bet.liveStats && (
          <View style={styles.liveStats}>
            <View style={styles.liveStat}>
              <Text style={styles.liveStatLabel}>Current: {bet.liveStats.current}</Text>
              <Text style={styles.liveStatLabel}>Projected: {bet.liveStats.projected}</Text>
            </View>
          </View>
        )}

      </View>

      <View style={styles.betActions}>
        {/* Score section on the left */}
        <View style={styles.scoreSection}>
          {bet.gameInfo.currentScore && (
            <View style={styles.scoreContainer}>
              <View style={styles.teamScoreRow}>
                <Text style={styles.teamName}>{bet.gameInfo.homeTeam}</Text>
                <Text style={styles.teamScore}>{extractHomeScore(bet.gameInfo.currentScore)}</Text>
              </View>
              <View style={styles.teamScoreRow}>
                <Text style={styles.teamName}>{bet.gameInfo.awayTeam}</Text>
                <Text style={styles.teamScore}>{extractAwayScore(bet.gameInfo.currentScore)}</Text>
              </View>
            </View>
          )}
          {!bet.gameInfo.currentScore && bet.gameInfo.gameTime && (
            <Text style={styles.timeText}>{bet.gameInfo.gameTime}</Text>
          )}
        </View>

        {/* Bet type and actions on the right */}
        <View style={styles.betTypeSection}>
          <View style={styles.betTypeContainer}>
            {getTrendIcon(bet.betType)}
            <Text style={styles.betTypeText}>
              {bet.betType.toUpperCase()}
            </Text>
          </View>
          {onViewBet && (
            <Eye size={16} color={colors.primary} />
          )}
        </View>
      </View>
    </PressableCard>
  )
}

const styles = StyleSheet.create({
  betItem: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  liveIndicatorText: {
    fontSize: typography.xs,
    color: colors.background,
    fontWeight: "600",
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
    marginBottom: 6,
  },
  propProgressContainer: {
    marginTop: 4, // Reduce gap from prop text
    marginBottom: 2, // Further reduce gap to score section
  },
  progressBarWrapper: {
    position: 'relative',
    height: 6,
  },
  goalMarker: {
    position: 'absolute',
    top: -3, // Center the dot on the progress bar line (progress bar height is 6, so center at -3)
    transform: [{ translateX: -4 }], // Center the dot horizontally
    alignItems: 'center',
  },
  goalMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginBottom: 2,
  },
  goalMarkerText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  currentMarker: {
    position: 'absolute',
    top: -3, // Center the dot on the progress bar line (progress bar height is 6, so center at -3)
    transform: [{ translateX: -4 }], // Center the dot horizontally
    alignItems: 'center',
  },
  currentMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  progressText: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
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
    fontSize: typography.xs,
    color: colors.text,
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
  scoreContainer: {
    gap: 2,
  },
  teamScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    fontSize: typography.xs,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    maxWidth: '70%',
  },
  teamScore: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 8,
    minWidth: 20,
    textAlign: 'right',
  },
  timeText: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  betActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -2, // Move scores up closer to progress bar
  },
  scoreSection: {
    flex: 1,
    marginRight: 20, // Move scores to the left to avoid interference
  },
  betTypeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  betTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  betTypeText: {
    fontSize: typography.xs,
    color: colors.muted,
    fontWeight: "500",
  },
})
