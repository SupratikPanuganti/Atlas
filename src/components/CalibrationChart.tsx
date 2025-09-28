import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface CalibrationBin {
  p: string
  n: number
  hit_rate: number
  aiSummary?: string  // AI explanation for this data point
}

interface CalibrationChartProps {
  bins: CalibrationBin[]
  onPointPress?: (bin: CalibrationBin, index: number) => void
  selectedPoint?: CalibrationBin | null
}

const { width: screenWidth } = Dimensions.get("window")
const chartWidth = screenWidth - 80 // More padding to prevent cutoff
const chartHeight = 300 // Increased from 200

export function CalibrationChart({ bins, onPointPress, selectedPoint }: CalibrationChartProps) {
  // Transform data for chart
  const chartData = bins.map((bin) => ({
    predicted: Number.parseFloat(bin.p),
    actual: bin.hit_rate,
    count: bin.n,
  }))

  // Perfect calibration line (y = x)
  const perfectLine = chartData.map((d) => d.predicted)

  // Actual calibration line
  const actualLine = chartData.map((d) => d.actual)

  const renderDots = () => {
    return chartData.map((point, index) => {
      const x = (point.predicted * (chartWidth - 40)) / 1.0 + 20 // Scale to chart width with padding
      const y = (1 - point.actual) * (chartHeight - 40) + 20 // Scale and invert with padding
      const bin = bins[index]
      const isSelected = selectedPoint === bin
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.dotContainer,
            {
              left: x - 20, // Even larger hit area (40px total)
              top: y - 20,
              width: 40,
              height: 40,
            },
          ]}
          onPress={() => onPointPress?.(bin, index)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.dot,
              {
                backgroundColor: colors.positive,
                borderColor: isSelected ? colors.text : 'transparent',
                borderWidth: isSelected ? 2 : 0,
                width: isSelected ? 16 : 12,
                height: isSelected ? 16 : 12,
                borderRadius: isSelected ? 8 : 6,
              },
            ]}
          />
        </TouchableOpacity>
      )
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Model Accuracy Check</Text>
      <Text style={styles.subtitle}>How often we're right when we say "X% chance"</Text>

      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>1.0</Text>
          <Text style={styles.axisLabel}>0.8</Text>
          <Text style={styles.axisLabel}>0.6</Text>
          <Text style={styles.axisLabel}>0.4</Text>
          <Text style={styles.axisLabel}>0.2</Text>
          <Text style={styles.axisLabel}>0.0</Text>
        </View>
        
        {/* Y-axis title */}
        <View style={styles.yAxisTitle}>
          <Text style={styles.yAxisTitleText}>What Actually Happened</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Perfect calibration line (diagonal) */}
          <View style={styles.perfectLine} />

          {/* Data points */}
          <View style={styles.dotsContainer}>{renderDots()}</View>

          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {[0.2, 0.4, 0.6, 0.8].map((value) => (
              <View key={value} style={[styles.gridLine, { top: `${(1 - value) * 100}%` }]} />
            ))}
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>0.0</Text>
        <Text style={styles.axisLabel}>0.2</Text>
        <Text style={styles.axisLabel}>0.4</Text>
        <Text style={styles.axisLabel}>0.6</Text>
        <Text style={styles.axisLabel}>0.8</Text>
        <Text style={styles.axisLabel}>1.0</Text>
      </View>

      <Text style={styles.xAxisTitle}>What We Predicted</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.muted }]} />
          <Text style={styles.legendText}>Perfect calibration (ideal)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.positive }]} />
          <Text style={styles.legendText}>Our actual performance</Text>
        </View>
      </View>

      {/* Selected Point Insight */}
      {selectedPoint && (
        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>
            When we said "{(Number.parseFloat(selectedPoint.p) * 100).toFixed(0)}% chance"
          </Text>
          <Text style={styles.insightStats}>
            We predicted: {(Number.parseFloat(selectedPoint.p) * 100).toFixed(1)}% | 
            We were right: {(selectedPoint.hit_rate * 100).toFixed(1)}% of the time | 
            Based on: {selectedPoint.n} bets
          </Text>
          {selectedPoint.aiSummary && (
            <Text style={styles.aiSummary}>
              {selectedPoint.aiSummary}
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

// Added named export for CalibrationChart component;

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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: "row",
    height: chartHeight,
    marginBottom: 12,
  },
  yAxis: {
    width: 30,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  yAxisTitle: {
    position: "absolute",
    left: -10,
    top: "50%",
    transform: [{ rotate: "-90deg" }],
    width: 200,
    alignItems: "center",
  },
  yAxisTitleText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  chartArea: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  perfectLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: colors.muted,
    borderStyle: "dashed",
    transform: [{ rotate: "45deg" }],
    transformOrigin: "center",
  },
  dotsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dotContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.muted + "30",
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 38,
    marginTop: 8,
  },
  xAxisTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  axisLabel: {
    fontSize: typography.xs,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  insightBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  insightStats: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  aiSummary: {
    fontSize: typography.sm,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
})
