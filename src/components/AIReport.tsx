import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Card } from "./ui/Card"
import { Brain } from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface AIReportProps {
  propName: string
  report: {
    liveReasoning: string
    historicalReasoning: string
  }
  loading?: boolean
}

export function AIReport({ propName, report, loading = false }: AIReportProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Brain size={20} color={colors.primary} />
        <Text style={styles.title}>AI Analysis</Text>
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={colors.primary} 
            style={styles.loadingIndicator}
          />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Reasoning</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Generating AI analysis...</Text>
            </View>
          ) : (
            <Text style={styles.sectionText}>{report.liveReasoning}</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historical Reasoning</Text>
          <Text style={styles.sectionText}>{report.historicalReasoning}</Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: 8,
  },
  content: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.primary,
  },
  sectionText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontStyle: 'italic',
  },
})
