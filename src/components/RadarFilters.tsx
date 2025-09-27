import { View, Text, StyleSheet } from "react-native"
import { Button } from "./ui/Button"
import { Chip } from "./ui/Chip"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface RadarFiltersProps {
  selectedSport: string
  selectedPropTypes: string[]
  minDelta: number
  onSportChange: (sport: string) => void
  onPropTypeToggle: (propType: string) => void
  onMinDeltaChange: (delta: number) => void
}

const PROP_TYPES = ["PASS_YDS", "RUSH_YDS", "REC", "PASS_TD", "RUSH_TD", "REC_YDS"]
const DELTA_OPTIONS = [0, 0.5, 1.0, 1.5, 2.0]

const RadarFilters = ({
  selectedSport,
  selectedPropTypes,
  minDelta,
  onSportChange,
  onPropTypeToggle,
  onMinDeltaChange,
}: RadarFiltersProps) => {
  return (
    <View style={styles.container}>
      {/* Sport Filter (Fixed for demo) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sport</Text>
        <Button
          title="NCAAF (Demo)"
          onPress={() => onSportChange("NCAAF")}
          variant="outline"
          size="sm"
          style={styles.sportButton}
        />
      </View>

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

      {/* Min Delta Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Min Δ vs Median</Text>
        <View style={styles.deltaContainer}>
          {DELTA_OPTIONS.map((delta) => (
            <Button
              key={delta}
              title={delta === 0 ? "Any" : `+${delta}`}
              onPress={() => onMinDeltaChange(delta)}
              variant={minDelta === delta ? "primary" : "outline"}
              size="sm"
              style={styles.deltaButton}
            />
          ))}
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
