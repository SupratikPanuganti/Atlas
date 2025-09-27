import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus, TrendingUp, Clock, Users, Trophy, AlertTriangle } from 'lucide-react-native'
import { colors } from '../theme/colors'
import { typography } from '../theme/typography'
import { useAppStore } from '../store/useAppStore'
import type { H2HLine, GeminiResponse } from '../types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FadeInView } from '../components/animations/FadeInView'
import { H2HLineCard } from '../components/H2HLineCard'

export default function H2HScreen() {
  const { 
    user, 
    h2hLines, 
    userCredits, 
    setH2hLines, 
    addH2hLine, 
    matchH2hLine,
    getGeminiAnalysis 
  } = useAppStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'matched' | 'live'>('all')
  const [showEducationalBanner, setShowEducationalBanner] = useState(true)

  useEffect(() => {
    loadH2HLines()
  }, [])

  const loadH2HLines = async () => {
    setRefreshing(true)
    // Simulate API call - in real app, this would fetch from server
    setTimeout(() => {
      if (h2hLines.length === 0) {
        setH2hLines(getMockH2HLines())
      }
      setRefreshing(false)
    }, 1000)
  }

  const onRefresh = () => {
    loadH2HLines()
  }

  const handleTakeOpposite = (line: H2HLine) => {
    if (!user) return
    
    Alert.alert(
      'Take Opposite Side',
      `Do you want to take ${line.side === 'over' ? 'UNDER' : 'OVER'} ${line.customLine} for ${line.stakeCredits} credits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          matchH2hLine(line.id, user.id)
          Alert.alert('Success', 'Match created! Good luck!')
        }}
      ]
    )
  }

  const handleCreateLine = (lineData: Omit<H2HLine, 'id' | 'creatorId' | 'createdAt' | 'status'>) => {
    if (!user) return
    
    const newLine: H2HLine = {
      ...lineData,
      id: `h2h_${Date.now()}`,
      creatorId: user.id,
      createdAt: new Date().toISOString(),
      status: 'open',
    }
    
    addH2hLine(newLine)
    Alert.alert('Success', 'Line created and posted for matching!')
  }

  const filteredLines = h2hLines.filter(line => {
    if (filter === 'all') return true
    return line.status === filter
  })

  const getStatusColor = (status: H2HLine['status']) => {
    switch (status) {
      case 'open': return colors.primary
      case 'matched': return colors.warning
      case 'live': return colors.success
      case 'settled': return colors.muted
      case 'cancelled': return colors.destructive
      default: return colors.muted
    }
  }

  const getStatusIcon = (status: H2HLine['status']) => {
    switch (status) {
      case 'open': return Clock
      case 'matched': return Users
      case 'live': return TrendingUp
      case 'settled': return Trophy
      case 'cancelled': return AlertTriangle
      default: return Clock
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>H2H</Text>
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>H2H Lines</Text>
            <Text style={styles.subtitle}>Create custom prop lines and match 1-on-1</Text>
          </View>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>1500</Text>
            <Text style={styles.creditsLabel}>Credits</Text>
          </View>
        </View>
        
        {/* Educational Banner */}
        {showEducationalBanner && (
          <View style={styles.educationalBanner}>
            <AlertTriangle size={16} color={colors.warning} />
            <Text style={styles.bannerText}>
              Educational - Not Betting Advice • Credits Only
            </Text>
            <TouchableOpacity
              onPress={() => setShowEducationalBanner(false)}
              style={styles.bannerClose}
            >
              <Text style={styles.bannerCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
      }}>
        {(['all', 'open', 'matched', 'live'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            onPress={() => setFilter(filterOption)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: filter === filterOption ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: filter === filterOption ? colors.primary : colors.border,
            }}
          >
            <Text style={[
              {
                fontSize: typography.caption,
                color: filter === filterOption ? colors.background : colors.text,
                fontWeight: filter === filterOption ? '600' : '400',
                textTransform: 'capitalize',
              }
            ]}>
              {filterOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Button */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            paddingHorizontal: 20,
          }}
        >
          <Plus size={20} color="#000000" />
          <Text style={[{ fontSize: typography.button, color: '#000000' }]}>
            Create Line
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lines List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {filteredLines.length === 0 ? (
            <FadeInView>
              <Card style={{
                padding: 40,
                alignItems: 'center',
                backgroundColor: colors.card,
              }}>
                <Users size={48} color={colors.muted} />
                <Text style={[{ fontSize: typography.h3, color: colors.text, marginTop: 16, textAlign: 'center' }]}>
                  No lines yet
                </Text>
                <Text style={[{ fontSize: typography.body, color: colors.muted, marginTop: 8, textAlign: 'center' }]}>
                  {filter === 'all' 
                    ? 'Create your first custom prop line to get started'
                    : `No ${filter} lines found`
                  }
                </Text>
              </Card>
            </FadeInView>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredLines.map((line, index) => (
                <H2HLineCard 
                  key={line.id} 
                  line={line} 
                  index={index}
                  onTakeOpposite={() => Alert.alert('Success', 'Match created! Good luck!')}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Line Modal */}
      <CreateLineModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateLine}
        userCredits={userCredits}
        getGeminiAnalysis={getGeminiAnalysis}
      />
    </SafeAreaView>
  )
}


function CreateLineModal({
  visible,
  onClose,
  onCreate,
  userCredits,
  getGeminiAnalysis,
}: {
  visible: boolean
  onClose: () => void
  onCreate: (line: Omit<H2HLine, 'id' | 'creatorId' | 'createdAt' | 'status'>) => void
  userCredits: number
  getGeminiAnalysis: (player: string, propType: string, customLine: number) => Promise<any>
}) {
  const [sport, setSport] = useState<H2HLine['sport']>('basketball')
  const [player, setPlayer] = useState('')
  const [propType, setPropType] = useState<H2HLine['propType']>('points')
  const [customLine, setCustomLine] = useState('')
  const [side, setSide] = useState<'over' | 'under'>('over')
  const [stakeCredits, setStakeCredits] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiResponse | null>(null)

  const handleAnalyze = async () => {
    if (!player || !customLine) return

    setIsAnalyzing(true)
    try {
      const analysis = await getGeminiAnalysis(player, propType, parseFloat(customLine))
      setGeminiAnalysis(analysis)
    } catch (error) {
      console.error('Failed to get Gemini analysis:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCreate = () => {
    if (!player || !customLine || !stakeCredits) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    const stake = parseInt(stakeCredits)
    if (stake > userCredits) {
      Alert.alert('Error', 'Insufficient credits')
      return
    }

    const newLine: Omit<H2HLine, 'id' | 'creatorId' | 'createdAt' | 'status'> = {
      sport,
      game: {
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        gameTime: 'Tonight 8:00 PM',
        gameId: 'game_123',
      },
      player,
      propType,
      customLine: parseFloat(customLine),
      side,
      stakeCredits: stake,
      payoutMultiplier: 1.0,
      marketLine: geminiAnalysis ? geminiAnalysis.fairValue + 1 : undefined,
      fairValue: geminiAnalysis?.fairValue,
      geminiAnalysis: geminiAnalysis ? {
        fairValueExplanation: geminiAnalysis.explanation,
        suggestedAdjustment: geminiAnalysis.riskAssessment,
        matchLikelihood: 0.65,
      } : undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    onCreate(newLine)
    onClose()
    
    // Reset form
    setPlayer('')
    setCustomLine('')
    setStakeCredits('')
    setGeminiAnalysis(null)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={[{ fontSize: typography.h3, color: colors.text }]}>Create Line</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[{ fontSize: typography.button, color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ gap: 24 }}>
            {/* Sport Selection */}
            <View>
              <Text style={[{ fontSize: typography.label, color: colors.text, marginBottom: 8 }]}>Sport</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['basketball', 'football'] as const).map((sportOption) => (
                  <TouchableOpacity
                    key={sportOption}
                    onPress={() => setSport(sportOption)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: sport === sportOption ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: sport === sportOption ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={[
                      {
                        fontSize: typography.button,
                        color: sport === sportOption ? colors.background : colors.text,
                        textAlign: 'center',
                        textTransform: 'capitalize',
                      }
                    ]}>
                      {sportOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Player Name */}
            <View>
              <Text style={[{ fontSize: typography.label, color: colors.text, marginBottom: 8 }]}>Player Name</Text>
              <TextInput
                value={player}
                onChangeText={setPlayer}
                placeholder="e.g., LeBron James"
                placeholderTextColor={colors.muted}
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Prop Type */}
            <View>
              <Text style={[{ fontSize: typography.label, color: colors.text, marginBottom: 8 }]}>Prop Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {getAvailableProps(sport).map((prop) => (
                  <TouchableOpacity
                    key={prop}
                    onPress={() => setPropType(prop)}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      backgroundColor: propType === prop ? colors.primary : colors.card,
                      borderWidth: 1,
                      borderColor: propType === prop ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={[
                      {
                        fontSize: typography.caption,
                        color: propType === prop ? colors.background : colors.text,
                        fontWeight: propType === prop ? '600' : '400',
                      }
                    ]}>
                      {getPropDisplayName(prop)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Line */}
            <View>
              <Text style={[{ fontSize: typography.label, color: colors.text, marginBottom: 8 }]}>Your Line</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {(['over', 'under'] as const).map((sideOption) => (
                    <TouchableOpacity
                      key={sideOption}
                      onPress={() => setSide(sideOption)}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        backgroundColor: side === sideOption ? colors.primary : colors.card,
                        borderWidth: 1,
                        borderColor: side === sideOption ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={[
                        {
                          fontSize: typography.caption,
                          color: side === sideOption ? colors.background : colors.text,
                          textTransform: 'uppercase',
                        }
                      ]}>
                        {sideOption}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={customLine}
                  onChangeText={setCustomLine}
                  placeholder="36.5"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    flex: 1,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    fontSize: 16,
                  }}
                  onBlur={handleAnalyze}
                />
              </View>
            </View>

            {/* Stake Credits */}
            <View>
              <Text style={[{ fontSize: typography.label, color: colors.text, marginBottom: 8 }]}>
                Stake Credits (Available: {userCredits})
              </Text>
              <TextInput
                value={stakeCredits}
                onChangeText={setStakeCredits}
                placeholder="100"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* Gemini Analysis */}
            {isAnalyzing && (
              <View style={{
                padding: 16,
                backgroundColor: colors.card,
                borderRadius: 8,
                borderColor: colors.border,
                borderWidth: 1,
              }}>
                <Text style={[{ fontSize: typography.caption, color: colors.muted }]}>
                  🤖 Analyzing with AI...
                </Text>
              </View>
            )}

            {geminiAnalysis && (
              <View style={{
                padding: 16,
                backgroundColor: colors.card,
                borderRadius: 8,
                borderColor: colors.border,
                borderWidth: 1,
              }}>
                <Text style={[{ fontSize: typography.caption, color: colors.muted, marginBottom: 8 }]}>
                  🤖 AI Analysis
                </Text>
                <Text style={[{ fontSize: typography.small, color: colors.text, marginBottom: 8 }]}>
                  {geminiAnalysis.explanation}
                </Text>
                <Text style={[{ fontSize: typography.small, color: colors.warning }]}>
                  💡 {geminiAnalysis.riskAssessment}
                </Text>
                {geminiAnalysis.suggestedLine && (
                  <Text style={[{ fontSize: typography.small, color: colors.primary, marginTop: 4 }]}>
                    Suggested: {side.toUpperCase()} {geminiAnalysis.suggestedLine}
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={{ padding: 20 }}>
          <Button
            title="Create Line"
            onPress={handleCreate}
            disabled={!player || !customLine || !stakeCredits}
            style={{
              backgroundColor: colors.primary,
              opacity: (!player || !customLine || !stakeCredits) ? 0.5 : 1,
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

// Helper functions
function getPropDisplayName(propType: H2HLine['propType']): string {
  const displayNames = {
    points: 'Points',
    assists: 'Assists',
    rebounds: 'Rebounds',
    passing_yards: 'Passing Yards',
    rushing_yards: 'Rushing Yards',
    receptions: 'Receptions',
    goals: 'Goals',
    saves: 'Saves',
  }
  return displayNames[propType]
}

function getAvailableProps(sport: H2HLine['sport']): H2HLine['propType'][] {
  switch (sport) {
    case 'basketball':
      return ['points', 'assists', 'rebounds']
    case 'football':
      return ['passing_yards', 'rushing_yards', 'receptions']
    case 'soccer':
      return ['goals', 'saves']
    default:
      return ['points', 'assists', 'rebounds']
  }
}

function getStatusColor(status: H2HLine['status']): string {
  switch (status) {
    case 'open': return colors.primary
    case 'matched': return colors.warning
    case 'live': return colors.success
    case 'settled': return colors.muted
    case 'cancelled': return colors.destructive
    default: return colors.muted
  }
}

function getStatusIcon(status: H2HLine['status']) {
  switch (status) {
    case 'open': return Clock
    case 'matched': return Users
    case 'live': return TrendingUp
    case 'settled': return Trophy
    case 'cancelled': return AlertTriangle
    default: return Clock
  }
}


const styles = StyleSheet.create({
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  creditsContainer: {
    alignItems: 'flex-end',
  },
  creditsText: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  creditsLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  educationalBanner: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: typography.caption,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  bannerClose: {
    marginLeft: 8,
    padding: 4,
  },
  bannerCloseText: {
    fontSize: 16,
    color: colors.warning,
  },
})

function getMockH2HLines(): H2HLine[] {
  return [
    {
      id: '1',
      creatorId: 'user123',
      sport: 'basketball',
      game: {
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        gameTime: 'Tonight 8:00 PM',
        gameId: 'game_123',
      },
      player: 'LeBron James',
      propType: 'points',
      customLine: 36.5,
      side: 'over',
      stakeCredits: 250,
      payoutMultiplier: 1.0,
      marketLine: 34.5,
      fairValue: 35.2,
      geminiAnalysis: {
        fairValueExplanation: 'Based on recent form and matchup analysis, fair value is around 35.2 points',
        suggestedAdjustment: 'Consider 35.5 for better match probability',
        matchLikelihood: 0.73,
      },
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      creatorId: 'user456',
      sport: 'basketball',
      game: {
        homeTeam: 'Celtics',
        awayTeam: 'Heat',
        gameTime: 'Tonight 10:30 PM',
        gameId: 'game_456',
      },
      player: 'Jayson Tatum',
      propType: 'points',
      customLine: 28.5,
      side: 'under',
      stakeCredits: 150,
      payoutMultiplier: 1.0,
      status: 'matched',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(),
      matchedWith: 'user789',
      matchedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      creatorId: 'user789',
      sport: 'basketball',
      game: {
        homeTeam: 'Nuggets',
        awayTeam: 'Suns',
        gameTime: 'Live - Q3 8:32',
        gameId: 'game_789',
      },
      player: 'Nikola Jokic',
      propType: 'assists',
      customLine: 8.5,
      side: 'over',
      stakeCredits: 300,
      payoutMultiplier: 1.0,
      status: 'live',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      matchedWith: 'user123',
      matchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      gameStarted: true,
      liveData: {
        currentValue: 7,
        timeRemaining: 'Q3 8:32',
        gameStatus: 'live',
        lastUpdate: new Date().toISOString(),
      },
    },
  ]
}
