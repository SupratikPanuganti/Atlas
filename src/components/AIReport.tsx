import { View, Text, StyleSheet } from "react-native"
import { Card } from "./ui/Card"
import { Brain } from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface AIReportProps {
  propName: string
  report: {
    reasoning: string
    confidence: string
  }
}

export function AIReport({ propName, report }: AIReportProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Brain size={20} color={colors.primary} />
        <Text style={styles.title}>AI Analysis</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Reasoning</Text>
          <Text style={styles.sectionText}>{report.reasoning}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Confidence</Text>
          <Text style={styles.sectionText}>{report.confidence}</Text>
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
})
