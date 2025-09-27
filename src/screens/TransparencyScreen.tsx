import { ScrollView, StyleSheet, TouchableOpacity, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, Info, BookOpen } from "lucide-react-native"
import { CalibrationChart } from "../components/CalibrationChart"
import { MetricsBlock } from "../components/MetricsBlock"
import { YesterdayBuckets } from "../components/YesterdayBuckets"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import { useState } from "react"

export default function TransparencyScreen() {
  const navigation = useNavigation()
  const [selectedCalibrationPoint, setSelectedCalibrationPoint] = useState<any>(null)
  const [showEducationalTips, setShowEducationalTips] = useState(false)
  
  const handleBackToLivePricing = () => {
    navigation.goBack()
  }
  
  // Demo calibration data with AI summaries for all points
  const demoBins = [
    { 
      p: "0.55", 
      n: 120, 
      hit_rate: 0.53,
      aiSummary: "Slightly overconfident at 55% - our model predicted 55% but only hit 53%. This suggests we may be too optimistic on close calls."
    },
    { 
      p: "0.60", 
      n: 95, 
      hit_rate: 0.61,
      aiSummary: "Excellent calibration at 60% - we predicted 60% and hit 61%. This shows our model is well-tuned for moderate confidence bets."
    },
    { 
      p: "0.65", 
      n: 90, 
      hit_rate: 0.64,
      aiSummary: "Very well calibrated at 65% - predicted 65%, actual 64%. Our model shows strong reliability in this confidence range."
    },
    { 
      p: "0.70", 
      n: 75, 
      hit_rate: 0.69,
      aiSummary: "Good calibration at 70% - predicted 70%, actual 69%. This range shows consistent performance for higher confidence bets."
    },
    { 
      p: "0.75", 
      n: 60, 
      hit_rate: 0.77,
      aiSummary: "Slightly underconfident at 75% - we predicted 75% but hit 77%. This suggests we may be too conservative on high-confidence plays."
    },
    { 
      p: "0.80", 
      n: 45, 
      hit_rate: 0.82,
      aiSummary: "Well calibrated at 80% - predicted 80%, actual 82%. Our model shows strong reliability for high-confidence betting opportunities."
    },
    // Add some poorly calibrated examples
    { 
      p: "0.85", 
      n: 30, 
      hit_rate: 0.73,
      aiSummary: "Significantly overconfident at 85% - we predicted 85% but only hit 73%. This indicates our model struggles with very high confidence predictions."
    },
    { 
      p: "0.90", 
      n: 20, 
      hit_rate: 0.65,
      aiSummary: "Severely overconfident at 90% - we predicted 90% but only hit 65%. This suggests we need to be more cautious with extreme confidence bets."
    },
  ]

  // Generate AI summaries for all points (including poorly calibrated ones)
  const enhancedDemoBins = demoBins.map(bin => {
    const predicted = Number.parseFloat(bin.p)
    const actual = bin.hit_rate
    const difference = Math.abs(predicted - actual)
    
    // If no AI summary provided, generate one based on performance
    if (!bin.aiSummary) {
      if (difference < 0.05) {
        bin.aiSummary = `Well calibrated at ${(predicted * 100).toFixed(0)}% - predicted ${(predicted * 100).toFixed(1)}%, actual ${(actual * 100).toFixed(1)}%. Our model shows reliable performance in this range.`
      } else if (predicted > actual) {
        bin.aiSummary = `Overconfident at ${(predicted * 100).toFixed(0)}% - we predicted ${(predicted * 100).toFixed(1)}% but only hit ${(actual * 100).toFixed(1)}%. This suggests we may be too optimistic on these types of bets.`
      } else {
        bin.aiSummary = `Underconfident at ${(predicted * 100).toFixed(0)}% - we predicted ${(predicted * 100).toFixed(1)}% but hit ${(actual * 100).toFixed(1)}%. This suggests we may be too conservative on these opportunities.`
      }
    }
    
    return bin
  })

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

        {/* Educational Header */}
        <View style={styles.educationalHeader}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => setShowEducationalTips(!showEducationalTips)}
          >
            <BookOpen size={16} color={colors.primary} />
            <Text style={styles.helpText}>Learn About Calibration</Text>
          </TouchableOpacity>
        </View>

        {/* Educational Tips */}
        {showEducationalTips && (
          <View style={styles.educationalTips}>
            <Text style={styles.tipsTitle}>What is Model Calibration?</Text>
            <Text style={styles.tipsText}>
              Calibration measures how well our predictions match reality. When we say "60% chance," 
              we should be right about 60% of the time. Click on chart points to see detailed analysis!
            </Text>
            <Text style={styles.tipsText}>
              • Green dots = Well calibrated (predicted ≈ actual)
              • Blue dots = Needs improvement (predicted ≠ actual)
            </Text>
          </View>
        )}

        {/* Calibration Chart */}
        <CalibrationChart 
          bins={enhancedDemoBins} 
          onPointPress={(bin) => setSelectedCalibrationPoint(bin)}
          selectedPoint={selectedCalibrationPoint}
        />

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
  educationalHeader: {
    marginVertical: 16,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  helpText: {
    fontSize: typography.sm,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: typography.medium,
  },
  educationalTips: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + "20",
  },
  tipsTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
})
