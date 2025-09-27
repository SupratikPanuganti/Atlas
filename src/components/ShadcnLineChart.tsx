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
  ev?: number  // Expected Value
  confidence?: number  // Confidence level (0-1)
  factors?: string[]  // Key factors driving this recommendation
  currentTotal?: number  // Current total for the prop (PRA, points, assists, etc.)
  targetLine?: number  // The line they need to hit (e.g., 42.5 for PRA)
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
  // Fixed Y-axis scale for Expected Value from -20% to +20%
  const minEV = -0.20
  const maxEV = 0.20
  const range = maxEV - minEV

  // Create base point at x=0, y=initial EV (or 0)
  const initialEV = data.length > 0 ? (data[0].ev || 0) : 0
  const basePoint: ChartPoint = {
    time: "Start",
    percentage: 0, // Not used for Y-axis anymore
    ev: initialEV,
    type: 'normal',
    insight: "Initial prediction"
  }
  
  // Include base point and all data points
  const allData = [basePoint, ...data]

  const getPointColor = (point: ChartPoint, index: number) => {
    // Base point (x=0) should be gray
    if (index === 0) return colors.neutral
    
    // If player is subbed out, make it gray
    if (point.gameEvent && (
      point.gameEvent.toLowerCase().includes('subbed out') ||
      point.gameEvent.toLowerCase().includes('bench rotation') ||
      point.gameEvent.toLowerCase().includes('sits')
    )) {
      return colors.neutral
    }
    
    // Use EV-based coloring for better recommendations
    if (point.ev !== undefined) {
      if (point.ev > 0.1) return colors.positive      // Strong positive EV
      if (point.ev > 0.05) return colors.primary      // Moderate positive EV  
      if (point.ev > -0.05) return colors.warning     // Neutral EV
      return colors.negative                           // Negative EV
    }
    
    // Fallback to type-based coloring
    switch (point.type) {
      case 'peak': return colors.positive
      case 'trough': return colors.negative
      default: return colors.primary
    }
  }

  const renderChartLine = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    
    const points = allData.map((point, index) => {
      // Evenly space dots across the chart width with padding
      const x = (index / (allData.length - 1)) * (chartWidth - 40)
      // Use EV for Y-axis positioning
      const pointEV = point.ev !== undefined ? point.ev : 0
      const y = chartHeight - 40 - ((pointEV - minEV) / range) * (chartHeight - 80)
      
      return { x, y, point }
    })

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>+{(maxEV * 100).toFixed(0)}%</Text>
          <Text style={styles.yLabel}>0%</Text>
          <Text style={styles.yLabel}>{(minEV * 100).toFixed(0)}%</Text>
        </View>
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines - horizontal only */}
          <View style={styles.gridLine} />
          {/* Zero line (break-even) */}
          <View style={[styles.gridLine, { top: chartHeight / 2, backgroundColor: colors.textSecondary + '60', height: 2 }]} />
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
            borderColor: getPointColor(selectedPoint, allData.indexOf(selectedPoint)),
            backgroundColor: getPointColor(selectedPoint, allData.indexOf(selectedPoint)) + '10'
          }
        ]}>
          <Text style={[
            styles.insightTitle,
            { color: getPointColor(selectedPoint, allData.indexOf(selectedPoint)) }
          ]}>
            {selectedPoint.time === "Start" ? 'Base Point' :
             selectedPoint.gameEvent && (
               selectedPoint.gameEvent.toLowerCase().includes('subbed out') ||
               selectedPoint.gameEvent.toLowerCase().includes('bench rotation') ||
               selectedPoint.gameEvent.toLowerCase().includes('sits')
             ) ? 'Player Subbed Out' :
             selectedPoint.ev !== undefined ? 
               (selectedPoint.ev > 0.1 ? 'Strong Bet' :
                selectedPoint.ev > 0.05 ? 'Good Bet' :
                selectedPoint.ev > -0.05 ? 'Neutral' : 'Avoid Bet') :
             selectedPoint.type === 'peak' ? 'Peak Opportunity' : 
             selectedPoint.type === 'trough' ? 'Trough Opportunity' : 'Normal Point'}
          </Text>
          <Text style={styles.insightText}>
            {selectedPoint.ev !== undefined ? 
              `EV: ${(selectedPoint.ev * 100).toFixed(1)}% | Confidence: ${((selectedPoint.confidence || 0) * 100).toFixed(0)}%` :
              `${selectedPoint.percentage.toFixed(1)}% at ${selectedPoint.time}`
            }
          </Text>
          {selectedPoint.currentTotal !== undefined && selectedPoint.targetLine !== undefined && (
            <Text style={styles.statsText}>
              Current: {selectedPoint.currentTotal} | Target: {selectedPoint.targetLine} | 
              Need: {(selectedPoint.targetLine - selectedPoint.currentTotal).toFixed(1)}
            </Text>
          )}
          {selectedPoint.factors && selectedPoint.factors.length > 0 && (
            <Text style={styles.factorsText}>
              Key factors: {selectedPoint.factors.join(', ')}
            </Text>
          )}
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
  factorsText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statsText: {
    fontSize: typography.sm,
    color: colors.text,
    fontWeight: typography.medium,
    marginTop: 4,
  },
})
