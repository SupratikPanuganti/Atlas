"use client"

import React from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import * as Haptics from "expo-haptics"
import { Button } from "./ui/Button"
import type { AlertBannerProps } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

export function AlertBanner({ title, subtitle, onView, onSnooze }: AlertBannerProps) {
  const slideAnim = React.useRef(new Animated.Value(-100)).current

  React.useEffect(() => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="View" onPress={onView} variant="primary" size="sm" style={styles.viewButton} />
          <Button title="Snooze 10m" onPress={onSnooze} variant="outline" size="sm" style={styles.snoozeButton} />
        </View>
      </View>
    </Animated.View>
  )
}

// Added named export for AlertBanner component;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    minWidth: 60,
  },
  snoozeButton: {
    minWidth: 80,
  },
})
