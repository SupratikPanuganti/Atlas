import { ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft } from "lucide-react-native"
import { CalibrationChart } from "../components/CalibrationChart"
import { MetricsBlock } from "../components/MetricsBlock"
import { YesterdayBuckets } from "../components/YesterdayBuckets"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

export default function TransparencyScreen() {
  const navigation = useNavigation()
  
  const handleBackToLivePricing = () => {
    navigation.goBack()
  }
  
  // Demo calibration data
  const demoBins = [
    { p: "0.55", n: 120, hit_rate: 0.53 },
    { p: "0.60", n: 95, hit_rate: 0.61 },
    { p: "0.65", n: 90, hit_rate: 0.64 },
    { p: "0.70", n: 75, hit_rate: 0.69 },
    { p: "0.75", n: 60, hit_rate: 0.77 },
    { p: "0.80", n: 45, hit_rate: 0.82 },
  ]

  // Demo bucket data
  const demoBuckets = [
    { decile: 1, predicted_ev: -0.045, realized_ev: -0.052, count: 21 },
    { decile: 2, predicted_ev: -0.028, realized_ev: -0.031, count: 21 },
    { decile: 3, predicted_ev: -0.015, realized_ev: -0.018, count: 21 },
    { decile: 4, predicted_ev: -0.005, realized_ev: -0.002, count: 21 },
    { decile: 5, predicted_ev: 0.008, realized_ev: 0.011, count: 21 },
    { decile: 6, predicted_ev: 0.022, realized_ev: 0.019, count: 21 },
    { decile: 7, predicted_ev: 0.038, realized_ev: 0.041, count: 21 },
    { decile: 8, predicted_ev: 0.056, realized_ev: 0.053, count: 21 },
    { decile: 9, predicted_ev: 0.078, realized_ev: 0.082, count: 21 },
    { decile: 10, predicted_ev: 0.105, realized_ev: 0.108, count: 21 },
  ]

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLivePricing}>
          <ArrowLeft size={20} color={colors.primary} />
          <Text style={styles.backText}>Back to Live Pricing</Text>
        </TouchableOpacity>

        {/* Metrics Overview */}
        <MetricsBlock brier={0.19} sampleSize={210} lastUpdate="Today 6:00 AM EST" />

        {/* Calibration Chart */}
        <CalibrationChart bins={demoBins} />

        {/* Yesterday's Performance */}
        <YesterdayBuckets buckets={demoBuckets} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 120,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
  },
  backText: {
    fontSize: typography.base,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: typography.medium,
  },
})
