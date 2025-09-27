import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { Clock } from "lucide-react-native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface MomentItem {
  id: string
  time: string
  description: string
  driver?: string
}

interface MomentFeedProps {
  moments: MomentItem[]
  onMomentPress?: (moment: MomentItem) => void
}

export function MomentFeed({ moments, onMomentPress }: MomentFeedProps) {
  const renderMoment = ({ item }: { item: MomentItem }) => (
    <TouchableOpacity style={styles.momentItem} onPress={() => onMomentPress?.(item)} activeOpacity={0.7}>
      <View style={styles.momentHeader}>
        <Clock size={14} color={colors.muted} />
        <Text style={styles.momentTime}>{item.time}</Text>
      </View>
      <Text style={styles.momentDescription}>{item.description}</Text>
    </TouchableOpacity>
  )

  if (moments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No moments yet...</Text>
        <Text style={styles.emptySubtext}>Live game moments will appear here</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moment Feed</Text>
      <FlatList
        data={moments}
        renderItem={renderMoment}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  )
}

// Added named export for MomentFeed component;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  momentItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  momentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  momentTime: {
    fontSize: typography.xs,
    color: colors.muted,
    marginLeft: 6,
    fontVariant: ["tabular-nums"],
  },
  momentDescription: {
    fontSize: typography.sm,
    color: colors.text,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.muted,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: colors.muted,
  },
})
