import { View, Text, StyleSheet, Dimensions } from "react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface CalibrationBin {
  p: string
  n: number
  hit_rate: number
}

interface CalibrationChartProps {
  bins: CalibrationBin[]
}

const { width: screenWidth } = Dimensions.get("window")
const chartWidth = screenWidth - 64 // Account for padding

export function CalibrationChart({ bins }: CalibrationChartProps) {
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
      const x = (point.predicted * chartWidth) / 1.0 // Scale to chart width
      const y = (1 - point.actual) * 200 // Scale and invert for SVG coordinates

      return (
        <View
          key={index}
          style={[
            styles.dot,
            {
              left: x - 4,
              top: y - 4,
              backgroundColor: Math.abs(point.predicted - point.actual) < 0.05 ? colors.positive : colors.primary,
            },
          ]}
        />
      )
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calibration Chart</Text>
      <Text style={styles.subtitle}>Predicted vs Actual Hit Rate</Text>

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

      <Text style={styles.xAxisTitle}>Predicted Probability</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.muted }]} />
          <Text style={styles.legendText}>Perfect calibration</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Actual performance</Text>
        </View>
      </View>
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
    height: 200,
    marginBottom: 12,
  },
  yAxis: {
    width: 30,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
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
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
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
})
