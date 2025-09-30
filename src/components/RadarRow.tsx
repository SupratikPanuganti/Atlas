import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useEffect } from "react"
import { ChevronRight, Clock, Star, Star as StarFilled, Activity, TrendingUp } from "lucide-react-native"
import type { RadarItem } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import { useAppStore } from "../store/useAppStore"

interface RadarRowProps {
  item: RadarItem
  onPress: (item: RadarItem) => void
  forceSign?: "both" | "positive" | "negative"
}

export function RadarRow({ item, onPress, forceSign = "both" }: RadarRowProps) {
  const { addBetFromRadar, starredPropIds, starLine, bets, setBets, createUserBet, user, generatePropId } = useAppStore()
  
  // Check if this item should be starred based on favorited bets
  const isFavorited = bets.some(bet => {
    if (bet.is_favorited !== true) return false
    const betPropId = generatePropId({
      prop: bet.prop,
      betType: bet.betType,
      line: bet.line,
      player: bet.player
    })
    return betPropId === item.propId
  })
  
  // Sync starred state if there's a mismatch
  useEffect(() => {
    if (isFavorited && !starredPropIds.includes(item.propId)) {
      console.log('RadarRow: Syncing starred state for favorited item:', item.propId)
      starLine(item.propId)
    } else if (!isFavorited && starredPropIds.includes(item.propId)) {
      console.log('RadarRow: Syncing starred state for unfavorited item:', item.propId)
      starLine(item.propId)
    }
  }, [isFavorited, starredPropIds, item.propId, starLine])
  
  const getDeltaColor = (delta: number) => {
    // < 1 = negative (red), > 1 = positive (green), = 1 = neutral (gray)
    if (delta > 1) return colors.positive
    if (delta < 1) return colors.danger
    return colors.muted // neutral gray for delta = 1
  }

  // If a filter is active, force color for all rows in the list
  const getColorForDisplay = (delta: number) => {
    if (forceSign === "positive") return colors.positive
    if (forceSign === "negative") return colors.danger
    return getDeltaColor(delta)
  }

  const getStaleColor = (minutes: number) => {
    // < 10min = green, >= 10min = red
    return minutes < 10 ? colors.positive : colors.danger
  }

  // Check if this is a recently updated NCAA line (within last 5 minutes)
  const isRecentlyUpdated = item.sport === 'NCAA' && item.staleMin <= 5

  // Get technical depth indicators for NCAA lines
  const getTechnicalDepth = () => {
    if (item.sport !== 'NCAA') return null
    
    return {
      volume: item.volume || Math.floor(Math.random() * 1000) + 100,
      confidence: item.confidence || 0.6,
      hasRecentUpdate: isRecentlyUpdated
    }
  }

  const technicalDepth = getTechnicalDepth()

  return (
    <TouchableOpacity style={[
      styles.container,
      isRecentlyUpdated && styles.recentlyUpdated
    ]} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Prop Label */}
        <View style={styles.propContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.propLabel}>{item.label}</Text>
            {isRecentlyUpdated && (
              <View style={styles.liveIndicator}>
                <Activity size={12} color={colors.primary} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          {technicalDepth && (
            <View style={styles.technicalRow}>
              <View style={styles.techIndicator}>
                <TrendingUp size={10} color={colors.muted} />
                <Text style={styles.techText}>Vol: {technicalDepth.volume}</Text>
              </View>
              <View style={styles.techIndicator}>
                <Text style={styles.techText}>Conf: {(technicalDepth.confidence * 100).toFixed(0)}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Delta vs Median */}
        <View style={styles.deltaContainer}>
          {/* Display delta directly (0-1 = negative, 1+ = positive) */}
          <Text style={[styles.deltaValue, { color: getColorForDisplay(item.deltaVsMedian) }]}> 
            {item.deltaVsMedian.toFixed(1)}
          </Text>
          <Text style={styles.deltaLabel}>vs median</Text>
        </View>

        {/* Stale Time */}
        <View style={styles.staleContainer}>
          <Clock size={14} color={getStaleColor(item.staleMin)} />
          <Text style={[styles.staleValue, { color: getStaleColor(item.staleMin) }]}>{item.staleMin}m</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
            onPress={async () => {
              if (!user) {
                // User not authenticated - show login prompt
                return
              }

              if (isFavorited) {
                // Already starred - unfavorite (update database and local state)
                console.log('RadarRow: Unfavoriting item:', item.propId)
                
                // Find the corresponding bet using the consistent propId format
                const betToUpdate = bets.find(bet => {
                  const betPropId = generatePropId({
                    prop: bet.prop,
                    betType: bet.betType,
                    line: bet.line,
                    player: bet.player
                  })
                  return betPropId === item.propId
                })
                
                console.log('RadarRow: Found bet to unfavorite:', betToUpdate)
                
                if (betToUpdate) {
                  try {
                    // Update database
                    const { bettingService } = await import('../services/bettingService')
                    await bettingService.updateBetFavoritedStatus(betToUpdate.id, false)
                    
                    // Update local state
                    setBets(bets.map(bet => 
                      bet.id === betToUpdate.id 
                        ? { ...bet, is_favorited: false }
                        : bet
                    ))
                    console.log('RadarRow: Updated bet favorited status to false')
                  } catch (error) {
                    console.error('RadarRow: Error updating bet favorited status:', error)
                    // Fallback: remove from local state if database update fails
                    setBets(bets.filter(bet => bet.id !== betToUpdate.id))
                  }
                }
                
                // Remove from starred list
                starLine(item.propId)
              } else {
                // Not starred - favorite (add to starred list and create bet)
                console.log('RadarRow: Favoriting item:', item.propId)
                
                try {
                  // Use the betting line ID from the item
                  const bettingLineId = item.bettingLineId
                  
                  console.log('RadarRow: Attempting to create bet with:', {
                    userId: user.id,
                    bettingLineId,
                    item: item
                  })
                  
                  if (!bettingLineId) {
                    console.log('RadarRow: No betting line ID available, using fallback')
                    throw new Error('No betting line ID available')
                  }
                  
                  // Create bet from the betting line using the service
                  const { bettingService } = await import('../services/bettingService')
                  const newBet = await bettingService.createBetFromLine(user.id, bettingLineId, 50)
                  
                  console.log('RadarRow: Successfully created bet:', newBet)
                  
                  // Add the new bet to the store (with is_favorited: true)
                  setBets([{ ...newBet, is_favorited: true }, ...bets])
                  
                  // Add to starred list
                  starLine(item.propId)
                } catch (error) {
                  console.error('RadarRow: Error creating bet:', error)
                  console.log('RadarRow: Falling back to mock bet creation')
                  // Fallback to the old method if database bet creation fails
                  const fallbackBet = addBetFromRadar(item)
                  console.log('RadarRow: Successfully created fallback bet:', fallbackBet)
                  
                  // Add to starred list after successful fallback bet creation
                  starLine(item.propId)
                }
              }
            }}
            style={styles.favoriteButton}
          >
            {isFavorited ? (
              <Star size={18} color={colors.primary} fill={colors.primary} />
            ) : (
              <Star size={18} color={colors.muted} />
            )}
          </TouchableOpacity>
          <ChevronRight size={20} color={colors.muted} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.muted + '15',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recentlyUpdated: {
    borderColor: colors.primary + '40',
    borderWidth: 2,
    backgroundColor: colors.primary + '05',
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  propContainer: {
    flex: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  propLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  liveText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginLeft: 4,
  },
  technicalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  techText: {
    fontSize: typography.xs,
    color: colors.muted,
    fontWeight: typography.medium,
  },
  deltaContainer: {
    flex: 1,
    alignItems: "center",
  },
  deltaValue: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    fontVariant: ["tabular-nums"],
  },
  deltaLabel: {
    fontSize: typography.xs,
    color: colors.muted,
    marginTop: 2,
  },
  staleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  staleValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    marginLeft: 4,
    fontVariant: ["tabular-nums"],
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.primary + "12",
  },
})

// Added named export for RadarRow component;
