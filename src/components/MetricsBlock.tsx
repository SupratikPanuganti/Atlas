import { View, Text, StyleSheet } from "react-native"
import { TrendingUp, Target, Clock } from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface MetricsBlockProps {
  brier: number
  sampleSize: number
  lastUpdate: string
}

export function MetricsBlock({ brier, sampleSize, lastUpdate }: MetricsBlockProps) {
  const getBrierColor = (score: number) => {
    if (score < 0.15) return colors.positive
    if (score < 0.25) return colors.primary
    return colors.danger
  }

  const getBrierLabel = (score: number) => {
    if (score < 0.15) return "Excellent"
    if (score < 0.25) return "Good"
    return "Needs Improvement"
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Model Performance</Text>

      <View style={styles.metricsGrid}>
        {/* Brier Score */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Target size={20} color={getBrierColor(brier)} />
            <Text style={styles.metricLabel}>Brier Score</Text>
          </View>
          <Text style={[styles.metricValue, { color: getBrierColor(brier) }]}>{brier.toFixed(3)}</Text>
          <Text style={styles.metricSubtext}>{getBrierLabel(brier)}</Text>
        </View>

        {/* Sample Size */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <TrendingUp size={20} color={colors.primary} />
            <Text style={styles.metricLabel}>Sample Size</Text>
          </View>
          <Text style={styles.metricValue}>{sampleSize.toLocaleString()}</Text>
          <Text style={styles.metricSubtext}>predictions</Text>
        </View>

        {/* Last Update */}
        <View style={[styles.metricCard, styles.fullWidth]}>
          <View style={styles.metricHeader}>
            <Clock size={20} color={colors.muted} />
            <Text style={styles.metricLabel}>Last Updated</Text>
          </View>
          <Text style={styles.metricValue}>{lastUpdate}</Text>
          <Text style={styles.metricSubtext}>Model recalibrated daily</Text>
        </View>
      </View>

      {/* Explanation */}
      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>About Brier Score</Text>
        <Text style={styles.explanationText}>
          Lower is better. Measures accuracy of probabilistic predictions. Perfect score = 0.0, random guessing = 0.25.
        </Text>
      </View>
    </View>
  )
}

// Added named export for MetricsBlock component;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: "45%",
  },
  fullWidth: {
    minWidth: "100%",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: typography.medium,
  },
  metricValue: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  metricSubtext: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  explanation: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  explanationTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
})
