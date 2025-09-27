import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { Card } from "./ui/Card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface ChartPoint {
  time: string
  percentage: number
  insight?: string
  type: 'peak' | 'trough' | 'normal'
  gameEvent?: string // e.g., "3-pointer made", "10 min dry spell"
}

interface PercentageChartProps {
  data: ChartPoint[]
  onPointPress?: (point: ChartPoint) => void
  selectedPoint?: ChartPoint | null
}

const { width: screenWidth } = Dimensions.get('window')
const chartWidth = screenWidth - 80 // Account for padding
const chartHeight = 160

export function PercentageChart({ data, onPointPress, selectedPoint }: PercentageChartProps) {
  const maxPercentage = Math.max(...data.map(d => d.percentage))
  const minPercentage = Math.min(...data.map(d => d.percentage))
  const range = maxPercentage - minPercentage
  
  const getPointColor = (type: string) => {
    switch (type) {
      case 'peak': return colors.positive
      case 'trough': return colors.negative
      default: return colors.primary
    }
  }
  
  const getPointIcon = (type: string) => {
    switch (type) {
      case 'peak': return <TrendingUp size={16} color={colors.positive} />
      case 'trough': return <TrendingDown size={16} color={colors.negative} />
      default: return <Minus size={16} color={colors.primary} />
    }
  }

  const renderChartLine = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * (chartWidth - 40)
      const y = chartHeight - 40 - ((point.percentage - minPercentage) / range) * (chartHeight - 80)
      
      return { x, y, point }
    })

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>{maxPercentage.toFixed(0)}%</Text>
          <Text style={styles.yLabel}>{((maxPercentage + minPercentage) / 2).toFixed(0)}%</Text>
          <Text style={styles.yLabel}>{minPercentage.toFixed(0)}%</Text>
        </View>
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />
          
          {/* Connected line segments */}
          <View style={styles.lineContainer}>
            {points.slice(0, -1).map((point, index) => {
              const nextPoint = points[index + 1]
              const length = Math.sqrt(
                Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
              )
              const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI)
              
              // Determine line color based on trend
              const isUpward = nextPoint.y < point.y
              const lineColor = isUpward ? colors.positive : colors.negative
              
              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: point.x,
                      top: point.y - 1.5, // Center the line with the point (point radius is 6, so center at -1.5)
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: lineColor,
                    }
                  ]}
                />
              )
            })}
          </View>
          
          {/* Data points */}
          {points.map(({ x, y, point }, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dataPoint,
                {
                  left: x - 6,
                  top: y - 6,
                  backgroundColor: getPointColor(point.type),
                  borderColor: selectedPoint === point ? colors.text : 'transparent',
                  borderWidth: selectedPoint === point ? 2 : 0,
                }
              ]}
              onPress={() => onPointPress?.(point)}
              activeOpacity={0.7}
            >
              {getPointIcon(point.type)}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* X-axis labels */}
        <View style={styles.xAxis}>
          {data.map((point, index) => (
            <Text key={index} style={styles.xLabel} numberOfLines={1}>
              {point.time}
            </Text>
          ))}
        </View>
      </View>
    )
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Percentage Odds vs Time</Text>
      </View>
      
      {renderChartLine()}
      
      {selectedPoint && (
        <View style={[
          styles.insightContainer,
          {
            borderLeftColor: selectedPoint.type === 'peak' ? colors.positive : 
                           selectedPoint.type === 'trough' ? colors.negative : colors.primary
          }
        ]}>
          <Text style={[
            styles.insightTitle,
            {
              color: selectedPoint.type === 'peak' ? colors.positive : 
                     selectedPoint.type === 'trough' ? colors.negative : colors.primary
            }
          ]}>
            {selectedPoint.type === 'peak' ? 'Peak Insight' : 
             selectedPoint.type === 'trough' ? 'Trough Insight' : 'Normal Point'}
          </Text>
          <Text style={styles.insightText}>
            {selectedPoint.insight || `At ${selectedPoint.time}, odds were ${selectedPoint.percentage.toFixed(1)}%`}
          </Text>
          {selectedPoint.gameEvent && (
            <Text style={[
              styles.gameEventText,
              {
                color: selectedPoint.type === 'peak' ? colors.positive : 
                       selectedPoint.type === 'trough' ? colors.negative : colors.primary
              }
            ]}>
              Game Event: {selectedPoint.gameEvent}
            </Text>
          )}
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  chartContainer: {
    height: chartHeight,
    marginBottom: 16,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: chartHeight,
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  yLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    position: 'absolute',
    left: 40,
    right: 0,
    top: 0,
    height: chartHeight,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  lineContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  lineSegment: {
    position: 'absolute',
    height: 3,
  },
  dataPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  xLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  insightContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  insightTitle: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.primary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  gameEventText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    marginTop: 4,
  },
})

