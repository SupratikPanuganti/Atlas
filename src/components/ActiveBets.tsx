import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { 
  Clock, 
  Play
} from "lucide-react-native"
import { BetItem } from "./BetItem"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import type { Bet } from "../types"
import { FadeInView } from "./animations"

interface ActiveBetsProps {
  bets: Bet[]
  onViewBet?: (bet: Bet) => void
}

export function ActiveBets({ bets, onViewBet }: ActiveBetsProps) {
  const activeBets = bets.filter(bet => bet.status === 'live' || bet.status === 'pending')
  
  if (activeBets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Play size={20} color={colors.primary} />
          <Text style={styles.title}>Active Bets</Text>
          <Text style={styles.count}>0</Text>
        </View>
        <View style={styles.emptyState}>
          <Clock size={32} color={colors.muted} />
          <Text style={styles.emptyText}>No active bets</Text>
          <Text style={styles.emptySubtext}>Place your first bet to get started</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Play size={20} color={colors.primary} />
        <Text style={styles.title}>Active Bets</Text>
        <Text style={styles.count}>{activeBets.length}</Text>
      </View>
      
      <View style={styles.betsList}>
        {activeBets.map((bet, index) => (
          <FadeInView key={bet.id} delay={index * 100} duration={600}>
            <BetItem
              bet={bet}
              onViewBet={onViewBet}
            />
          </FadeInView>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: typography["2xl"],
    fontWeight: "600",
    flex: 1,
    color: colors.text,
  },
  count: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: "600",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  betsList: {
    gap: 8,
  },
})
