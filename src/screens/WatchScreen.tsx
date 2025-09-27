import { View, Text, StyleSheet, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MessageCircle, Zap, Users } from "lucide-react-native"
import { Card } from "../components/ui/Card"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface HighlightItem {
  id: string
  time: string
  description: string
  type: "moment" | "stat" | "play"
}

export default function WatchScreen() {
  // Demo highlights data
  const highlights: HighlightItem[] = [
    {
      id: "1",
      time: "8:14 Q4",
      description: "Clutch assist leads to go-ahead 3-pointer",
      type: "moment",
    },
    {
      id: "2",
      time: "7:45 Q4",
      description: "Back-to-back turnovers shift momentum",
      type: "play",
    },
    {
      id: "3",
      time: "6:30 Q4",
      description: "Pace increases to 108 possessions/game",
      type: "stat",
    },
  ]

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case "moment":
        return <Zap size={16} color={colors.primary} />
      case "stat":
        return <Users size={16} color={colors.positive} />
      case "play":
        return <MessageCircle size={16} color={colors.danger} />
      default:
        return <Zap size={16} color={colors.muted} />
    }
  }

  const renderHighlight = ({ item }: { item: HighlightItem }) => (
    <View style={styles.highlightItem}>
      <View style={styles.highlightHeader}>
        {getHighlightIcon(item.type)}
        <Text style={styles.highlightTime}>{item.time}</Text>
      </View>
      <Text style={styles.highlightDescription}>{item.description}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Watch</Text>
          <Text style={styles.subtitle}>Game highlights and community</Text>
        </View>

        {/* Mini Chat Placeholder */}
        <Card style={styles.chatCard}>
          <View style={styles.chatHeader}>
            <MessageCircle size={20} color={colors.primary} />
            <Text style={styles.chatTitle}>Live Chat</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>1.2k online</Text>
            </View>
          </View>

          <View style={styles.chatPlaceholder}>
            <Text style={styles.chatPlaceholderText}>Chat feature coming soon...</Text>
            <Text style={styles.chatSubtext}>Connect with other prop traders during live games</Text>
          </View>
        </Card>

        {/* Moment of the Game */}
        <Card style={styles.highlightsCard}>
          <View style={styles.highlightsHeader}>
            <Zap size={20} color={colors.primary} />
            <Text style={styles.highlightsTitle}>Moment of the Game</Text>
          </View>

          <FlatList
            data={highlights}
            renderItem={renderHighlight}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.highlightsList}
          />
        </Card>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  chatCard: {
    marginBottom: 16,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  onlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.positive,
    marginRight: 6,
  },
  onlineText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  chatPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  chatPlaceholderText: {
    fontSize: typography.base,
    color: colors.muted,
    marginBottom: 4,
  },
  chatSubtext: {
    fontSize: typography.sm,
    color: colors.muted,
    textAlign: "center",
  },
  highlightsCard: {
    flex: 1,
  },
  highlightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  highlightsTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: 8,
  },
  highlightsList: {
    flex: 1,
  },
  highlightItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  highlightTime: {
    fontSize: typography.sm,
    color: colors.muted,
    marginLeft: 8,
    fontVariant: ["tabular-nums"],
  },
  highlightDescription: {
    fontSize: typography.base,
    color: colors.text,
    lineHeight: 20,
  },
})
