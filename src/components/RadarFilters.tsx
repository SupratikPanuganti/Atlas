import { View, Text, StyleSheet } from "react-native"
import { Button } from "./ui/Button"
import { Chip } from "./ui/Chip"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface RadarFiltersProps {
  selectedPropTypes: string[]
  selectedDeltaSign: "both" | "positive" | "negative"
  onPropTypeToggle: (propType: string) => void
  onDeltaSignChange: (sign: "both" | "positive" | "negative") => void
}

const PROP_TYPES = ["PASS YDS", "RUSH YDS", "REC", "PASS TD", "RUSH TD", "REC YDS"]

const RadarFilters = ({
  selectedPropTypes,
  onPropTypeToggle,
  selectedDeltaSign,
  onDeltaSignChange,
}: RadarFiltersProps) => {
  return (
    <View style={styles.container}>
      {/* Prop Type Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prop Types</Text>
        <View style={styles.chipContainer}>
          {PROP_TYPES.map((propType) => (
            <Chip
              key={propType}
              label={propType}
              onPress={() => onPropTypeToggle(propType)}
              variant={selectedPropTypes.includes(propType) ? "positive" : "default"}
            />
          ))}
        </View>
      </View>

      {/* Delta Sign Filter (grouped) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Δ vs Median</Text>
        <View style={styles.deltaContainer}>
          <Button
            title="-"
            onPress={() => onDeltaSignChange(selectedDeltaSign === "negative" ? "both" : "negative")}
            variant={selectedDeltaSign === "negative" ? "primary" : "outline"}
            size="sm"
            style={
              selectedDeltaSign === "negative"
                ? { ...styles.deltaButton, backgroundColor: colors.danger }
                : styles.deltaButton
            }
            textStyle={selectedDeltaSign === "negative" ? { color: colors.surface } : undefined}
          />

          <Button
            title="+"
            onPress={() => onDeltaSignChange(selectedDeltaSign === "positive" ? "both" : "positive")}
            variant={selectedDeltaSign === "positive" ? "primary" : "outline"}
            size="sm"
            style={styles.deltaButton}
          />
          

          
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sportButton: {
    alignSelf: "flex-start",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  deltaContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  deltaButton: {
    minWidth: 50,
  },
})

export { RadarFilters }
