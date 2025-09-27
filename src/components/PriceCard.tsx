import { View, Text, StyleSheet } from "react-native"
import { Card } from "./ui/Card"
import { Button } from "./ui/Button"
import { Chip } from "./ui/Chip"
import type { PriceCardProps } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

export function PriceCard({
  propId,
  worthPer1,
  pFair,
  fairPrice,
  marketPrice,
  mispricing,
  evPer1,
  thetaPer30s,
  band,
  fairOdds,
  onExplain,
  onSensitivity,
}: PriceCardProps) {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`

  return (
    <Card style={styles.card}>
      {/* Headline */}
      <View style={styles.header}>
        <Text style={styles.headline}>
          Worth {formatCurrency(worthPer1)}/$1 ({formatPercent(pFair)})
        </Text>
        <Text style={styles.subline}>
          Fair {formatCurrency(fairPrice)} vs Market {formatCurrency(marketPrice)} →
          <Text style={[styles.mispricing, { color: mispricing > 0 ? colors.positive : colors.negative }]}>
            {mispricing > 0 ? "+" : ""}
            {formatCurrency(mispricing)} mispriced
          </Text>
        </Text>
      </View>

      {/* Chips */}
      <View style={styles.chipsContainer}>
        <Chip
          label={`EV ${evPer1 > 0 ? "+" : ""}${formatCurrency(evPer1)}`}
          variant={evPer1 > 0 ? "positive" : "negative"}
        />
        <Chip label={`θ ${formatCurrency(thetaPer30s)}/30s`} variant="default" />
        <Chip label={`±${formatCurrency((band.hi - band.lo) / 2)} band`} variant="default" />
        <Chip label={`Fair odds ${fairOdds.toFixed(2)}`} variant="default" />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Explain" onPress={onExplain} variant="outline" size="sm" style={styles.button} />
        <Button title="Sensitivity" onPress={onSensitivity} variant="outline" size="sm" style={styles.button} />
      </View>

      {/* Watermark */}
      <Text style={styles.watermark}>Educational pricing • Not advice</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 12,
  },
  header: {
    marginBottom: 12,
  },
  headline: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  subline: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  mispricing: {
    fontWeight: typography.semibold,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
  },
  watermark: {
    fontSize: typography.xs,
    color: colors.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
})
