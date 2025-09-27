"use client"

import React from "react"
import { TouchableOpacity, StyleSheet, Animated } from "react-native"
import { colors } from "../../theme/colors"

interface SwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export function Switch({ value, onValueChange, disabled = false }: SwitchProps) {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [value])

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value)
    }
  }

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.muted + "40", colors.primary],
  })

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  })

  return (
    <TouchableOpacity style={[styles.container, disabled && styles.disabled]} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 24,
  },
  track: {
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabled: {
    opacity: 0.5,
  },
})
