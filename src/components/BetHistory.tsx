import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { 
  History, 
  Filter
} from "lucide-react-native"
import { Card } from "./ui/Card"
import { Chip } from "./ui/Chip"
import { BetItem } from "./BetItem"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import type { Bet } from "../types"
import { FadeInView, PressableCard } from "./animations"

interface BetHistoryProps {
  bets: Bet[]
  onViewBet?: (bet: Bet) => void
}

type FilterType = 'all' | 'won' | 'lost' | 'thisWeek' | 'thisMonth'

export function BetHistory({ bets, onViewBet }: BetHistoryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  
  const settledBets = bets.filter(bet => bet.status === 'won' || bet.status === 'lost')
  
  const filteredBets = settledBets.filter(bet => {
    const betDate = new Date(bet.placedAt)
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    switch (activeFilter) {
      case 'won':
        return bet.status === 'won'
      case 'lost':
        return bet.status === 'lost'
      case 'thisWeek':
        return betDate >= startOfWeek
      case 'thisMonth':
        return betDate >= startOfMonth
      default:
        return true
    }
  })


  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: settledBets.length },
    { key: 'won', label: 'Won', count: settledBets.filter(b => b.status === 'won').length },
    { key: 'lost', label: 'Lost', count: settledBets.filter(b => b.status === 'lost').length },
    { key: 'thisWeek', label: 'This Week', count: settledBets.filter(b => {
      const betDate = new Date(b.placedAt)
      const now = new Date()
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
      return betDate >= startOfWeek
    }).length },
    { key: 'thisMonth', label: 'This Month', count: settledBets.filter(b => {
      const betDate = new Date(b.placedAt)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return betDate >= startOfMonth
    }).length },
  ]

  if (settledBets.length === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <History size={20} color={colors.primary} />
          <Text style={styles.title}>Bet History</Text>
          <Text style={styles.count}>0</Text>
        </View>
        <View style={styles.emptyState}>
          <History size={32} color={colors.muted} />
          <Text style={styles.emptyText}>No bet history</Text>
          <Text style={styles.emptySubtext}>Your settled bets will appear here</Text>
        </View>
      </Card>
    )
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <History size={20} color={colors.primary} />
        <Text style={styles.title}>Bet History</Text>
        <Text style={styles.count}>{filteredBets.length}</Text>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter, index) => (
          <FadeInView key={filter.key} delay={index * 50} duration={400}>
            <Chip
              label={`${filter.label} (${filter.count})`}
              onPress={() => setActiveFilter(filter.key)}
              style={styles.filterChip}
            />
          </FadeInView>
        ))}
      </View>

      {/* Bet List */}
      <ScrollView 
        style={styles.betsList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {filteredBets.map((bet, index) => (
          <FadeInView key={bet.id} delay={index * 100} duration={500}>
            <BetItem
              bet={bet}
              showDate={true}
              onViewBet={onViewBet}
            />
          </FadeInView>
        ))}
      </ScrollView>

      {filteredBets.length === 0 && (
        <View style={styles.noResults}>
          <Filter size={24} color={colors.muted} />
          <Text style={styles.noResultsText}>No bets match this filter</Text>
        </View>
      )}
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
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
    maxHeight: 500,
    marginTop: 16,
  },
  noResults: {
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  noResultsText: {
    fontSize: typography.base,
    color: colors.muted,
  },
})
