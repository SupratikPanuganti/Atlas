import { View, Text, StyleSheet } from "react-native"
import { BarChart3 } from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface BucketData {
  decile: number
  predicted_ev: number
  realized_ev: number
  count: number
}

interface YesterdayBucketsProps {
  buckets: BucketData[]
}

export function YesterdayBuckets({ buckets }: YesterdayBucketsProps) {
  const renderBucket = ({ item }: { item: BucketData }) => {
    const difference = item.realized_ev - item.predicted_ev
    const isPositive = difference >= 0

    return (
      <View style={styles.bucketRow}>
        <View style={styles.decileContainer}>
          <Text style={styles.decileText}>D{item.decile}</Text>
        </View>

        <View style={styles.evContainer}>
          <Text style={styles.evLabel}>Predicted</Text>
          <Text style={styles.evValue}>
            {item.predicted_ev > 0 ? "+" : ""}
            {item.predicted_ev.toFixed(3)}
          </Text>
        </View>

        <View style={styles.evContainer}>
          <Text style={[styles.evLabel, { color: isPositive ? colors.positive : colors.danger }]}>Realized</Text>
          <Text style={[styles.evValue, { color: isPositive ? colors.positive : colors.danger }]}>
            {item.realized_ev > 0 ? "+" : ""}
            {item.realized_ev.toFixed(3)}
          </Text>
        </View>

        <View style={styles.diffContainer}>
          <Text style={[styles.diffValue, { color: isPositive ? colors.positive : colors.danger }]}>
            {difference > 0 ? "+" : ""}
            {difference.toFixed(3)}
          </Text>
        </View>

        <View style={styles.countContainer}>
          <Text style={styles.countText}>{item.count}</Text>
        </View>
      </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.decileContainer}>
        <Text style={styles.headerText}>Decile</Text>
      </View>
      <View style={styles.evContainer}>
        <Text style={styles.headerText}>Pred EV</Text>
      </View>
      <View style={styles.evContainer}>
        <Text style={styles.headerText}>Real EV</Text>
      </View>
      <View style={styles.diffContainer}>
        <Text style={styles.headerText}>Diff</Text>
      </View>
      <View style={styles.countContainer}>
        <Text style={styles.headerText}>Count</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <BarChart3 size={20} color={colors.primary} />
        <Text style={styles.title}>Yesterday's Performance</Text>
      </View>

      <Text style={styles.subtitle}>EV by confidence decile vs realized outcomes</Text>

      {renderHeader()}

      <View style={styles.list}>
        {buckets.map((item) => (
          <View key={item.decile.toString()}>
            {renderBucket({ item })}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Higher deciles should show higher EV. Consistent outperformance indicates good calibration.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "30",
    marginBottom: 4,
  },
  bucketRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "10",
  },
  decileContainer: {
    width: 50,
    alignItems: "center",
  },
  evContainer: {
    flex: 1,
    alignItems: "center",
  },
  diffContainer: {
    flex: 1,
    alignItems: "center",
  },
  countContainer: {
    width: 50,
    alignItems: "center",
  },
  headerText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.muted,
    textTransform: "uppercase",
  },
  decileText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.text,
  },
  evLabel: {
    fontSize: typography.xs,
    color: colors.muted,
    marginBottom: 2,
  },
  evValue: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  diffValue: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    fontVariant: ["tabular-nums"],
  },
  countText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  list: {
    maxHeight: 300,
  },
  footer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  footerText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
})
