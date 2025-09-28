import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { ChevronRight, Clock, Star, Star as StarFilled } from "lucide-react-native"
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
  const { addBetFromRadar, starredPropIds, starLine, bets, setBets } = useAppStore()
  const getDeltaColor = (delta: number) => {
    if (delta > 1) return colors.positive
    if (delta === 1) return colors.danger
    if (delta > 0.5) return colors.primary
    return colors.muted
  }

  // If a filter is active, force color for all rows in the list
  const getColorForDisplay = (delta: number) => {
    if (forceSign === "positive") return colors.positive
    if (forceSign === "negative") return colors.danger
    return getDeltaColor(delta)
  }

  const getStaleColor = (minutes: number) => {
    if (minutes > 5) return colors.danger
    if (minutes > 3) return colors.primary
    return colors.muted
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Prop Label */}
        <View style={styles.propContainer}>
          <Text style={styles.propLabel}>{item.label}</Text>
        </View>

        {/* Delta vs Median */}
        <View style={styles.deltaContainer}>
          {/* Display delta relative to 1.0 (x -> x-1) */}
          {(() => {
            const deltaDisplay = item.deltaVsMedian - 1
            const sign = deltaDisplay > 0 ? "+" : ""
            return (
              <Text style={[styles.deltaValue, { color: getColorForDisplay(item.deltaVsMedian) }]}> 
                {sign}
                {deltaDisplay.toFixed(1)}
              </Text>
            )
          })()}
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
            accessibilityLabel={starredPropIds.includes(item.propId) ? "Remove from favorites" : "Add to favorites"}
            onPress={() => {
              if (starredPropIds.includes(item.propId)) {
                // Already starred - unfavorite (remove from starred list and remove bet)
                starLine(item.propId)
                
                // Find and remove the corresponding bet
                const betToRemove = bets.find(bet => 
                  bet.prop === item.propId.split('_')[0] && 
                  bet.betType === (item.propId.split('_')[1] === 'over' ? 'over' : 'under') &&
                  bet.line === parseFloat(item.propId.split('_')[2])
                )
                
                if (betToRemove) {
                  setBets(bets.filter(bet => bet.id !== betToRemove.id))
                }
              } else {
                // Not starred - favorite (add to starred list and create bet)
                addBetFromRadar(item)
              }
            }}
            style={styles.favoriteButton}
          >
            {starredPropIds.includes(item.propId) ? (
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
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  propContainer: {
    flex: 2,
  },
  propLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
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
