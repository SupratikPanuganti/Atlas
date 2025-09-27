"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { TrendingUp } from "lucide-react-native"
import { Card } from "./ui/Card"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface ChartPoint {
  time: string
  percentage: number
  insight?: string
  type: 'peak' | 'trough' | 'normal'
  gameEvent?: string
}

interface ShadcnLineChartProps {
  data: ChartPoint[]
  onPointPress?: (point: ChartPoint) => void
  selectedPoint?: ChartPoint | null
  title?: string
  description?: string
}

const { width: screenWidth } = Dimensions.get('window')
const chartWidth = screenWidth - 80
const chartHeight = 200

export function ShadcnLineChart({ 
  data, 
  onPointPress, 
  selectedPoint, 
  title = "Line Chart - Linear",
  description = "January - June 2024"
}: ShadcnLineChartProps) {
  // Fixed Y-axis scale from 25% to 75%
  const minPercentage = 25
  const maxPercentage = 75
  const range = maxPercentage - minPercentage

  const getPointColor = (point: ChartPoint, index: number) => {
    // If it's the first point, use default color
    if (index === 0) return colors.primary
    
    // Find previous point to determine slope
    const previousPoint = data[data.indexOf(point) - 1]
    if (!previousPoint) return colors.primary
    
    // Positive slope (odds increasing) = green, negative slope (odds decreasing) = red
    const slope = point.percentage - previousPoint.percentage
    return slope > 0 ? colors.positive : colors.negative
  }

  const renderChartLine = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']

    // Remove first and last dots, keep middle dots
    const filteredData = data.slice(1, -1)
    
    const points = filteredData.map((point, index) => {
      // Evenly space dots across the chart width with padding
      const x = ((index + 1) / (filteredData.length + 1)) * (chartWidth - 40)
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
          {/* Grid lines - horizontal only */}
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />
          
          {/* Data points - clickable (no lines) */}
          {points.map(({ x, y, point }, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dataPoint,
                {
                  left: x - 6,
                  top: y - 6,
                  backgroundColor: getPointColor(point, index),
                  borderColor: getPointColor(point, index),
                  borderWidth: 2,
                }
              ]}
              onPress={() => onPointPress?.(point)}
              activeOpacity={0.7}
            />
          ))}
        </View>
        
        {/* X-axis labels - only quarters */}
        <View style={styles.xAxis}>
          {quarters.map((quarter, index) => (
            <Text key={quarter} style={styles.xLabel} numberOfLines={1}>
              {quarter}
            </Text>
          ))}
        </View>
      </View>
    )
  }

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      {/* Chart Content */}
      <View style={styles.content}>
        {renderChartLine()}
      </View>
      
      {/* Footer with color-coded insights */}
      {selectedPoint && (
        <View style={[
          styles.insightBox,
          {
            borderColor: getPointColor(selectedPoint, data.indexOf(selectedPoint)),
            backgroundColor: getPointColor(selectedPoint, data.indexOf(selectedPoint)) + '10'
          }
        ]}>
          <Text style={[
            styles.insightTitle,
            { color: getPointColor(selectedPoint, data.indexOf(selectedPoint)) }
          ]}>
            {selectedPoint.type === 'peak' ? 'Peak Opportunity' : 
             selectedPoint.type === 'trough' ? 'Trough Opportunity' : 'Normal Point'}
          </Text>
          <Text style={styles.insightText}>
            {selectedPoint.percentage.toFixed(1)}% at {selectedPoint.time}
          </Text>
          <Text style={styles.eventText}>
            {selectedPoint.gameEvent}
          </Text>
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
    marginBottom: 4,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  content: {
    marginBottom: 16,
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
    backgroundColor: colors.border + '30',
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
    height: 2,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
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
  insightBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  insightTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginBottom: 4,
  },
  insightText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  eventText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
})
