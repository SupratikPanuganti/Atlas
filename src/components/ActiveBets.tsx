import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { 
  Clock, 
  Play
} from "lucide-react-native"
import { Card } from "./ui/Card"
import { BetItem } from "./BetItem"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import type { Bet } from "../types"

interface ActiveBetsProps {
  bets: Bet[]
  onViewBet?: (bet: Bet) => void
}

export function ActiveBets({ bets, onViewBet }: ActiveBetsProps) {
  const activeBets = bets.filter(bet => bet.status === 'live' || bet.status === 'pending')
  
  if (activeBets.length === 0) {
    return (
      <Card style={styles.container}>
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
      </Card>
    )
  }


  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Play size={20} color={colors.primary} />
        <Text style={styles.title}>Active Bets</Text>
        <Text style={styles.count}>{activeBets.length}</Text>
      </View>
      
      <View style={styles.betsList}>
        {activeBets.map((bet) => (
          <BetItem
            key={bet.id}
            bet={bet}
            showCurrentValue={true}
            onViewBet={onViewBet}
          />
        ))}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    gap: 0,
    paddingBottom: 16,
  },
})
