"use client"

import React, { useRef } from "react"
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from "react-native"
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
  touchSize?: number // touch target size in px (default 44)
  fillSubdivisions?: number // how many small rectangles per segment
  fillSample?: 'left' | 'mid' | 'right' // Riemann sample point within each subdivision
}

const { width: screenWidth } = Dimensions.get('window')
const chartWidth = screenWidth - 80
const chartHeight = 200

export function ShadcnLineChart({ 
  data, 
  onPointPress, 
  selectedPoint, 
  title = "Line Chart - Linear",
  description = "January - June 2024",
  touchSize = 44,
  fillSubdivisions = 6,
  fillSample = 'mid',
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

  // animated scales per point so each point can scale on press
  const scalesRef = useRef<Animated.Value[]>([])

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

  // helper to convert hex to rgba string
  const hexToRgba = (hex: string, alpha = 1) => {
    const h = hex.replace('#', '')
    const bigint = parseInt(h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
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

    // compute baseline Y (EV = 0) inside chartArea coordinate space
    const zeroEV = 0
    const baselineY = chartHeight - 40 - ((zeroEV - minEV) / range) * (chartHeight - 80)

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
          
          {/* Subdivided small rectangles between points (Riemann-style) */}
          {points.length > 1 && (() => {
            const chartAreaWidth = chartWidth - 40
            const segRects: React.ReactNode[] = []

            // iterate over segments between consecutive points
            for (let i = 0; i < points.length - 1; i++) {
              const p1 = points[i]
              const p2 = points[i + 1]
              const segDx = p2.x - p1.x
              const segDy = p2.y - p1.y

              // safety: skip zero-length segments
              if (Math.abs(segDx) < 0.0001 && Math.abs(segDy) < 0.0001) continue

              const n = Math.max(1, Math.floor(fillSubdivisions))
              for (let j = 0; j < n; j++) {
                // sample offset within subinterval: left=0, mid=0.5, right=1
                const subTBase = j / n
                const subTCenter = (j + 1) / n
                let sampleOffset = 0.5
                if (fillSample === 'left') sampleOffset = 0
                else if (fillSample === 'right') sampleOffset = 1

                const t = subTBase + sampleOffset / n

                // sample position along the linear segment
                const xSample = p1.x + segDx * t
                const ySample = p1.y + segDy * t

                // interpolated EV for tinting
                const ev1 = p1.point.ev ?? 0
                const ev2 = p2.point.ev ?? 0
                const evSample = ev1 + (ev2 - ev1) * t

                // rectangle width: try to make them as small as physically possible but visible
                const rawWidth = Math.abs(segDx) / n
                const rectWidth = Math.max(2, Math.min(8, rawWidth * 0.9))

                const rectLeft = Math.max(0, Math.min(chartAreaWidth - rectWidth, xSample - rectWidth / 2))
                const rectHeight = Math.max(1, Math.abs(baselineY - ySample))
                const rectTop = Math.min(ySample, baselineY)

                const intensity = Math.min(1, Math.abs(evSample) / Math.abs(maxEV))
                const baseAlpha = 0.08
                const alpha = Math.min(0.95, baseAlpha + intensity * 1.0)
                const fillColor = evSample >= 0 ? hexToRgba(colors.positive, alpha) : hexToRgba(colors.negative, alpha)
                const borderCol = evSample >= 0 ? hexToRgba(colors.positive, Math.min(0.9, alpha + 0.1)) : hexToRgba(colors.negative, Math.min(0.9, alpha + 0.1))

                segRects.push(
                  <View
                    key={`area-${i}-${j}`}
                    style={{
                      position: 'absolute',
                      left: rectLeft,
                      top: rectTop,
                      width: rectWidth,
                      height: rectHeight,
                      backgroundColor: fillColor,
                      borderRadius: Math.min(4, rectWidth / 2),
                      borderWidth: 0.5,
                      borderColor: borderCol,
                    }}
                  />
                )
              }
            }

            return segRects
          })()}

          {/* Connecting line segments between consecutive points */}
          {points.length > 1 && points.slice(0, -1).map((p1, i) => {
            const p2 = points[i + 1]
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const length = Math.hypot(dx, dy)
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI
            const centerX = (p1.x + p2.x) / 2
            const centerY = (p1.y + p2.y) / 2

            const ev1 = p1.point.ev ?? 0
            const ev2 = p2.point.ev ?? 0
            const avgEV = (ev1 + ev2) / 2
            const segColor = avgEV >= 0 ? hexToRgba(colors.positive, 0.9) : hexToRgba(colors.negative, 0.9)

            return (
              <View
                key={`seg-${i}`}
                style={{
                  position: 'absolute',
                  left: centerX - length / 2,
                  top: centerY - 1, // half of thickness (2)
                  width: length,
                  height: 2,
                  backgroundColor: segColor,
                  borderRadius: 1,
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            )
          })}

          {/* Data points - clickable (no lines) */}
          {points.map(({ x, y, point }, index) => {
            if (!scalesRef.current[index]) scalesRef.current[index] = new Animated.Value(1)
            const scale = scalesRef.current[index]

            const areaSize = touchSize
            const onPressIn = () => {
              Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
            }
            const onPressOut = () => {
              Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
            }

            const hit = Math.max(12, Math.floor(touchSize / 3))

            return (
              <Pressable
                key={index}
                style={{
                  position: 'absolute',
                  left: x - areaSize / 2,
                  top: y - areaSize / 2,
                  width: areaSize,
                  height: areaSize,
                  borderRadius: areaSize / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent'
                }}
                onPress={() => onPointPress?.(point)}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                hitSlop={{ top: hit, bottom: hit, left: hit, right: hit }}
                accessibilityRole="button"
                accessible
                accessibilityLabel={point.time + (point.ev !== undefined ? ` EV ${(point.ev * 100).toFixed(1)}%` : '')}
              >
                <Animated.View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getPointColor(point, index),
                    borderColor: getPointColor(point, index),
                    borderWidth: 2,
                    transform: [{ scale }]
                  }}
                />
              </Pressable>
            )
          })}
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
