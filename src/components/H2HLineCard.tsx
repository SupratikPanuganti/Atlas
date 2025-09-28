import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Clock, Users, TrendingUp, Trophy, AlertTriangle, Target, Zap, ChevronDown, ChevronUp } from 'lucide-react-native'
import { colors } from '../theme/colors'
import { typography } from '../theme/typography'
import type { H2HLine } from '../types'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { FadeInView } from './animations/FadeInView'
import { PressableCard } from './animations/PressableCard'
import { useAppStore } from '../store/useAppStore'
import { liveTrackingService } from '../services/liveTrackingService'

interface H2HLineCardProps {
  line: H2HLine
  index: number
  onTakeOpposite?: () => void
  showActions?: boolean
}

export function H2HLineCard({ 
  line, 
  index, 
  onTakeOpposite,
  showActions = true 
}: H2HLineCardProps) {
  const { user, matchH2hLine } = useAppStore()
  const [liveData, setLiveData] = useState<any>(null)
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false)
  
  const StatusIcon = getStatusIcon(line.status)
  const statusColor = getStatusColor(line.status)
  const isUserLine = user?.id === line.creatorId

  useEffect(() => {
    // Initialize with existing liveData if available
    if (line.liveData) {
      setLiveData({
        currentValue: line.liveData.currentValue,
        needsValue: line.side === 'over' 
          ? Math.max(0, line.customLine - line.liveData.currentValue + 0.1)
          : Math.max(0, line.liveData.currentValue - line.customLine + 0.1),
        hitProbability: 0.75 // Mock probability
      })
    }

    if (line.status === 'live' || line.status === 'matched') {
      // Subscribe to live updates for this game
      const unsubscribe = liveTrackingService.subscribe((gameData) => {
        if (gameData.gameId === line.game.gameId) {
          const analysis = liveTrackingService.analyzeMatchedLine(line)
          setLiveData(analysis)
        }
      })

      // Start tracking the game
      liveTrackingService.startTrackingGame(line.game.gameId)

      return unsubscribe
    }
  }, [line.status, line.game.gameId, line.liveData, line.side, line.customLine])

  const handleTakeOpposite = () => {
    if (!user || !onTakeOpposite) return
    
    const isLive = line.status === 'live'
    const actionText = isLive ? 'Join Live Bet' : 'Take Opposite Side'
    const message = isLive 
      ? `Join this live bet: ${line.side === 'over' ? 'UNDER' : 'OVER'} ${line.customLine} for ${line.stakeCredits} credits?`
      : `Do you want to take ${line.side === 'over' ? 'UNDER' : 'OVER'} ${line.customLine} for ${line.stakeCredits} credits?`
    
    Alert.alert(
      actionText,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isLive ? 'Join Live' : 'Confirm', 
          onPress: () => {
            matchH2hLine(line.id, user.id)
            onTakeOpposite()
          }
        }
      ]
    )
  }

  const getPropDisplayName = (propType: string): string => {
    const displayNames: { [key: string]: string } = {
      'points': 'Points',
      'assists': 'Assists', 
      'rebounds': 'Rebounds',
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards',
      'receptions': 'Receptions'
    }
    return displayNames[propType] || propType
  }

  const formatTimeRemaining = (time: string): string => {
    if (time === '0:00') return 'Final'
    return time
  }

  return (
    <FadeInView delay={index * 100}>
      <PressableCard>
        <Card style={{
          padding: 16,
          backgroundColor: colors.card,
          borderColor: isUserLine ? colors.primary + '40' : colors.border,
          borderWidth: isUserLine ? 2 : 1,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[typography.h4, { color: colors.text }]}>
                  {line.player} {line.side.toUpperCase()} {line.customLine} {getPropDisplayName(line.propType)}
                </Text>
                {isUserLine && (
                  <View style={{
                    backgroundColor: colors.primary + '20',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                    <Text style={[typography.caption, { color: colors.primary, fontSize: 10 }]}>
                      YOUR LINE
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[typography.caption, { color: colors.muted, marginTop: 2 }]}>
                {line.game.awayTeam} @ {line.game.homeTeam} • {line.game.gameTime}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <StatusIcon size={16} color={statusColor} />
              <Text style={[typography.caption, { color: statusColor, textTransform: 'capitalize' }]}>
                {line.status}
              </Text>
            </View>
          </View>

          {/* Live Tracking */}
          {line.status === 'live' && (
            <View style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: colors.success + '15',
              borderRadius: 8,
              borderColor: colors.success + '40',
              borderWidth: 1,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>🔴 LIVE</Text>
                  {liveData ? (
                    <>
                      <Text style={[typography.h4, { color: colors.text }]}>
                        Current: {liveData.currentValue}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        Need: {liveData.needsValue.toFixed(1)} more
                      </Text>
                    </>
                  ) : (
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Loading live data...
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Hit Probability</Text>
                  {liveData ? (
                    <Text style={[typography.h3, { 
                      color: liveData.hitProbability > 0.6 ? colors.success : 
                             liveData.hitProbability > 0.4 ? colors.warning : colors.destructive,
                      fontWeight: '600'
                    }]}>
                      {Math.round(liveData.hitProbability * 100)}%
                    </Text>
                  ) : (
                    <Text style={[typography.h3, { color: colors.textSecondary }]}>
                      --
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Progress Bar */}
              {liveData && (
                <View style={{ marginTop: 8 }}>
                  <View style={{
                    height: 6,
                    backgroundColor: colors.border,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${Math.min(100, (liveData.currentValue / line.customLine) * 100)}%`,
                      backgroundColor: liveData.hitProbability > 0.5 ? colors.success : colors.warning,
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>0</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{line.customLine}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Line Comparison */}
          {line.marketLine && line.fairValue && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <View>
                <Text style={[typography.caption, { color: colors.muted }]}>Market Line</Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                  {line.marketLine}
                </Text>
              </View>
              <View>
                <Text style={[typography.caption, { color: colors.muted }]}>Fair Value</Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                  {line.fairValue}
                </Text>
              </View>
              <View>
                <Text style={[typography.caption, { color: colors.muted }]}>Your Line</Text>
                <Text style={[typography.body, { color: colors.primary, fontWeight: '600' }]}>
                  {line.customLine}
                </Text>
              </View>
            </View>
          )}

          {/* Gemini Analysis */}
          {line.geminiAnalysis && (
            <View style={{
              marginTop: 12,
              backgroundColor: colors.surface,
              borderRadius: 8,
              borderColor: colors.border,
              borderWidth: 1,
            }}>
              <TouchableOpacity
                onPress={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                style={{
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Zap size={14} color={colors.warning} />
                  <Text style={[typography.caption, { color: colors.muted }]}>
                    AI Analysis
                  </Text>
                </View>
                {isAnalysisExpanded ? (
                  <ChevronUp size={16} color={colors.muted} />
                ) : (
                  <ChevronDown size={16} color={colors.muted} />
                )}
              </TouchableOpacity>
              
              {isAnalysisExpanded && (
                <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                  <Text style={[typography.small, { color: colors.text }]}>
                    {line.geminiAnalysis.fairValueExplanation}
                  </Text>
                  {line.geminiAnalysis.suggestedAdjustment && (
                    <Text style={[typography.small, { color: colors.warning, marginTop: 4 }]}>
                      💡 {line.geminiAnalysis.suggestedAdjustment}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Stakes and Actions */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
          }}>
            <View>
              <Text style={[typography.caption, { color: colors.muted }]}>Stake</Text>
              <Text style={[typography.h4, { color: colors.text }]}>
                {line.stakeCredits} credits
              </Text>
              {line.payoutMultiplier !== 1.0 && (
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {line.payoutMultiplier}x payout
                </Text>
              )}
            </View>

            {showActions && (line.status === 'open' || line.status === 'live') && !isUserLine && (
              <TouchableOpacity
                onPress={handleTakeOpposite}
                style={{
                  backgroundColor: line.status === 'live' ? colors.warning : colors.success,
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Target size={16} color={colors.background} />
                <Text style={[typography.button, { color: colors.background }]}>
                  {line.status === 'live' ? 'Join Live' : `Take ${line.side === 'over' ? 'Under' : 'Over'}`}
                </Text>
              </TouchableOpacity>
            )}

            {line.status === 'matched' && !liveData && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.caption, { color: colors.warning }]}>
                  ⏳ Waiting for game start
                </Text>
              </View>
            )}

            {line.result && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.caption, { color: colors.muted }]}>Final Result</Text>
                <Text style={[typography.h4, { 
                  color: line.result.winner === 'creator' ? colors.success : colors.destructive 
                }]}>
                  {line.result.finalValue}
                </Text>
                <Text style={[typography.caption, { 
                  color: line.result.winner === 'creator' ? colors.success : colors.destructive 
                }]}>
                  {line.result.winner === 'creator' ? 'Creator Wins' : 'Opponent Wins'}
                </Text>
              </View>
            )}
          </View>

          {/* Match Likelihood */}
          {line.status === 'open' && line.geminiAnalysis?.matchLikelihood && (
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.caption, { color: colors.muted }]}>
                  Match Likelihood
                </Text>
                <Text style={[typography.caption, { color: colors.muted }]}>
                  {Math.round(line.geminiAnalysis.matchLikelihood * 100)}%
                </Text>
              </View>
              <View style={{
                height: 6,
                backgroundColor: colors.border,
                borderRadius: 3,
                marginTop: 4,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${line.geminiAnalysis.matchLikelihood * 100}%`,
                  backgroundColor: line.geminiAnalysis.matchLikelihood > 0.7 ? colors.success :
                                  line.geminiAnalysis.matchLikelihood > 0.4 ? colors.warning : colors.destructive,
                }} />
              </View>
            </View>
          )}

          {/* Gemini Recap */}
          {line.result?.geminiRecap && (
            <View style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: colors.primary + '10',
              borderRadius: 8,
              borderColor: colors.primary + '30',
              borderWidth: 1,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Trophy size={14} color={colors.primary} />
                <Text style={[typography.caption, { color: colors.primary }]}>
                  Game Recap
                </Text>
              </View>
              <Text style={[typography.small, { color: colors.text }]}>
                {line.result.geminiRecap}
              </Text>
            </View>
          )}

          {/* Expiry Timer for Open Lines */}
          {line.status === 'open' && (
            <ExpiryTimer expiresAt={line.expiresAt} />
          )}
        </Card>
      </PressableCard>
    </FadeInView>
  )
}

function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference <= 0) {
        setTimeLeft('Expired')
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`)
      } else {
        setTimeLeft(`${minutes}m left`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  if (!timeLeft || timeLeft === 'Expired') return null

  return (
    <View style={{
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    }}>
      <Clock size={12} color={colors.muted} />
      <Text style={[typography.caption, { color: colors.muted }]}>
        {timeLeft}
      </Text>
    </View>
  )
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
