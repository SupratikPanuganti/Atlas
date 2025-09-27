import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle, ActivityIndicator } from "react-native"
import { colors } from "../../theme/colors"
import { typography } from "../../theme/typography"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
  loading?: boolean
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  style,
  textStyle,
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], styles[size], (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === "outline" ? colors.text : colors.surface} 
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.card,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.muted,
  },

  // Sizes
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
  },

  // Text styles
  text: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.semibold,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.text,
  },

  // Size text
  smText: {
    fontSize: typography.sm,
  },
  mdText: {
    fontSize: typography.base,
  },
  lgText: {
    fontSize: typography.lg,
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.muted,
  },
})
