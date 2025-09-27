import React from "react"
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"
import { colors } from "../../theme/colors"
import { typography } from "../../theme/typography"

interface ChipProps {
  label: string
  onPress?: () => void
  variant?: "default" | "positive" | "negative"
  style?: ViewStyle
  textStyle?: TextStyle
  icon?: React.ReactNode
}

export function Chip({ label, onPress, variant = "default", style, textStyle, icon }: ChipProps) {
  const Component = onPress ? TouchableOpacity : React.Fragment
  const touchableProps = onPress ? { onPress, activeOpacity: 0.7 } : {}

  return (
    <Component {...touchableProps}>
      <React.Fragment>
        {React.createElement(
          onPress ? "div" : "div", // This will be View in RN
          {
            style: [styles.chip, styles[variant], style],
          },
          <>
            {icon}
            <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{label}</Text>
          </>,
        )}
      </React.Fragment>
    </Component>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  // Variants
  default: {
    backgroundColor: colors.muted + "20",
  },
  positive: {
    backgroundColor: colors.positive + "20",
  },
  negative: {
    backgroundColor: colors.negative + "20",
  },

  // Text styles
  text: {
    fontSize: typography.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.medium,
    marginLeft: 4,
  },
  defaultText: {
    color: colors.muted,
  },
  positiveText: {
    color: colors.positive,
  },
  negativeText: {
    color: colors.negative,
  },
})
