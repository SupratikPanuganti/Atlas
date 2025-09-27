"use client"

import React from "react"
import { View, Text, StyleSheet, PanGestureHandler, type PanGestureHandlerGestureEvent } from "react-native"
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, runOnJS } from "react-native-reanimated"
import { colors } from "../../theme/colors"
import { typography } from "../../theme/typography"

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onValueChange: (value: number) => void
  label?: string
  formatValue?: (value: number) => string
}

export function Slider({
  value,
  min,
  max,
  step = 0.01,
  onValueChange,
  label,
  formatValue = (v) => v.toFixed(2),
}: SliderProps) {
  const translateX = useSharedValue(0)
  const sliderWidth = 280

  // Convert value to position
  const valueToPosition = (val: number) => {
    return ((val - min) / (max - min)) * sliderWidth
  }

  // Convert position to value
  const positionToValue = (pos: number) => {
    const ratio = pos / sliderWidth
    const rawValue = min + ratio * (max - min)
    return Math.round(rawValue / step) * step
  }

  React.useEffect(() => {
    translateX.value = valueToPosition(value)
  }, [value])

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context) => {
      context.startX = translateX.value
    },
    onActive: (event, context) => {
      const newX = Math.max(0, Math.min(sliderWidth, context.startX + event.translationX))
      translateX.value = newX

      const newValue = positionToValue(newX)
      runOnJS(onValueChange)(newValue)
    },
  })

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const trackFillStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    }
  })

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{formatValue(value)}</Text>
        </View>
      )}

      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.trackFill, trackFillStyle]} />
        </View>

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </PanGestureHandler>
      </View>

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatValue(min)}</Text>
        <Text style={styles.rangeLabel}>{formatValue(max)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  value: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.primary,
    fontVariant: ["tabular-nums"],
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  track: {
    height: 4,
    backgroundColor: colors.muted + "30",
    borderRadius: 2,
    width: 280,
  },
  trackFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    top: 10,
    left: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  rangeLabel: {
    fontSize: typography.xs,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
})
