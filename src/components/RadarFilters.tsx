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

// Use actual database prop types from our minimal schema
const PROP_TYPES = [
  "pass_yards", 
  "rush_yards", 
  "rec_yards",
  "receptions", 
  "pass_tds", 
  "rush_tds", 
  "rec_tds", 
  "pass_completions", 
  "interceptions", 
  "total_tds"
]

// Display names for UI
const PROP_TYPE_DISPLAY_NAMES: { [key: string]: string } = {
  'pass_yards': 'PASS YDS',
  'rush_yards': 'RUSH YDS', 
  'rec_yards': 'REC YDS',
  'receptions': 'REC',
  'pass_tds': 'PASS TD',
  'rush_tds': 'RUSH TD',
  'rec_tds': 'REC TD',
  'pass_completions': 'PASS COMP',
  'interceptions': 'INT',
  'total_tds': 'TOTAL TD'
}

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
              label={PROP_TYPE_DISPLAY_NAMES[propType] || propType}
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

      {/* Removed freshness filter */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.muted + '20',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sportButton: {
    alignSelf: "flex-start",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  deltaContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  deltaButton: {
    minWidth: 50,
  },
})

export { RadarFilters }
