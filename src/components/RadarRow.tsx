import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { ChevronRight, Clock } from "lucide-react-native"
import type { RadarItem } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface RadarRowProps {
  item: RadarItem
  onPress: (item: RadarItem) => void
}

export function RadarRow({ item, onPress }: RadarRowProps) {
  const getDeltaColor = (delta: number) => {
    if (delta > 1) return colors.positive
    if (delta > 0.5) return colors.primary
    return colors.muted
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
          <Text style={[styles.deltaValue, { color: getDeltaColor(item.deltaVsMedian) }]}>
            {item.deltaVsMedian > 0 ? "+" : ""}
            {item.deltaVsMedian.toFixed(1)}
          </Text>
          <Text style={styles.deltaLabel}>vs median</Text>
        </View>

        {/* Stale Time */}
        <View style={styles.staleContainer}>
          <Clock size={14} color={getStaleColor(item.staleMin)} />
          <Text style={[styles.staleValue, { color: getStaleColor(item.staleMin) }]}>{item.staleMin}m</Text>
        </View>

        {/* Arrow */}
        <ChevronRight size={20} color={colors.muted} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginVertical: 4,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
})

// Added named export for RadarRow component;
