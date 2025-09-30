import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  Modal,
  Alert
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { RouteProp } from "@react-navigation/native"
import type { MainTabParamList } from "../types/navigation"
import { Search, MessageCircle, Plus, TrendingUp, Users, Send } from "lucide-react-native"
import { Card } from "../components/ui/Card"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import { bettingLinesService, type BettingLine } from "../services/bettingLinesService"

// Types for chat functionality
interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
}

interface LineConversation {
  id: string
  propId: string
  player: string
  market: string
  line: number
  betType: 'over' | 'under'
  participants: number
  lastMessage?: ChatMessage
  messages: ChatMessage[]
  isTrending: boolean
  createdAt: string
}

interface PropLine {
  propId: string
  player: string
  market: string
  line: number
  betType: 'over' | 'under'
  hasConversation: boolean
}

type ChatsRouteProp = RouteProp<MainTabParamList, 'Chats'>

export default function ChatsScreen() {
  const navigation = useNavigation()
  const route = useRoute<ChatsRouteProp>()
  const [activeTab, setActiveTab] = useState<'trending' | 'other'>('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [showStartConversation, setShowStartConversation] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<LineConversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [bettingLines, setBettingLines] = useState<BettingLine[]>([])

  // State for conversations - now will be populated from actual betting lines
  const [conversations, setConversations] = useState<LineConversation[]>([])

  // Load betting lines on component mount
  useEffect(() => {
    const loadBettingLines = async () => {
      try {
        setLoading(true)
        const lines = await bettingLinesService.getTodaysLines('NCAA')
        setBettingLines(lines)
        
        // Create some sample conversations from the actual betting lines
        // In a real app, these would come from a chat/conversation service
        const sampleConversations: LineConversation[] = lines.slice(0, 3).map((line, index) => {
          const edge = Math.max(line.edge_over, line.edge_under)
          const recommendation = line.edge_over > line.edge_under ? 'over' : 'under'
          const propId = `${line.prop_type}_${recommendation}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`
          
          return {
            id: `conv_${line.id}`,
            propId,
            player: line.player_name,
            market: bettingLinesService.getPropDisplayName(line.prop_type),
            line: line.line,
            betType: recommendation,
            participants: Math.floor(Math.random() * 20) + 5, // Random participants for demo
            isTrending: index < 2, // First two are trending
            createdAt: line.created_at,
            messages: [
              {
                id: `msg_${line.id}_1`,
                userId: 'user_1',
                username: 'PropTrader22',
                message: `${line.player_name} has a strong edge here. The ${recommendation} looks solid.`,
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
              },
              {
                id: `msg_${line.id}_2`,
                userId: 'user_2',
                username: 'BetShark',
                message: `AI confidence is ${Math.round(line.ai_confidence * 100)}%. That's a good sign.`,
                timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
              }
            ],
            lastMessage: {
              id: `msg_${line.id}_2`,
              userId: 'user_2',
              username: 'BetShark',
              message: `AI confidence is ${Math.round(line.ai_confidence * 100)}%. That's a good sign.`,
              timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
            }
          }
        })
        
        setConversations(sampleConversations)
      } catch (error) {
        console.error('Error loading betting lines:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBettingLines()
  }, [])
  // If navigated with a targetPropId, open that conversation if present
  useEffect(() => {
    const target = route.params?.targetPropId
    const ensureCreate = route.params?.ensureCreate
    if (!target) return
    const conv = conversations.find(c => c.propId === target)
    if (conv) {
      setSelectedConversation(conv)
    } else if (ensureCreate) {
      // Prompt to create
      Alert.alert(
        'No conversation yet',
        'Would you like to start a conversation for this line?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start', style: 'default', onPress: () => {
            // Find the betting line that matches this propId
            const matchingLine = bettingLines.find(line => {
              const edge = Math.max(line.edge_over, line.edge_under)
              const recommendation = line.edge_over > line.edge_under ? 'over' : 'under'
              const propId = `${line.prop_type}_${recommendation}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`
              return propId === target
            })
            
            if (matchingLine) {
              const edge = Math.max(matchingLine.edge_over, matchingLine.edge_under)
              const recommendation = matchingLine.edge_over > matchingLine.edge_under ? 'over' : 'under'
              
              const newConv: LineConversation = {
                id: `conv_${Date.now()}`,
                propId: target,
                player: matchingLine.player_name,
                market: bettingLinesService.getPropDisplayName(matchingLine.prop_type),
                line: matchingLine.line,
                betType: recommendation,
                participants: 1,
                isTrending: false,
                createdAt: new Date().toISOString(),
                messages: []
              }
              setConversations(prev => [newConv, ...prev])
              setSelectedConversation(newConv)
            }
          } }
        ]
      )
    }
  }, [route.params?.targetPropId, route.params?.ensureCreate, conversations, bettingLines])


  // Available lines without conversations - derived from betting lines
  const [availableLines, setAvailableLines] = useState<PropLine[]>([])

  // Update available lines when betting lines change
  useEffect(() => {
    if (bettingLines.length > 0) {
      const existingPropIds = new Set(conversations.map(conv => conv.propId))
      
      const available: PropLine[] = bettingLines
        .filter(line => {
          const edge = Math.max(line.edge_over, line.edge_under)
          const recommendation = line.edge_over > line.edge_under ? 'over' : 'under'
          const propId = `${line.prop_type}_${recommendation}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`
          return !existingPropIds.has(propId)
        })
        .slice(0, 10) // Limit to first 10 available lines
        .map(line => {
          const edge = Math.max(line.edge_over, line.edge_under)
          const recommendation = line.edge_over > line.edge_under ? 'over' : 'under'
          const propId = `${line.prop_type}_${recommendation}_${line.line}_${line.player_name.toLowerCase().replace(/\s+/g, '_')}`
          
          return {
            propId,
            player: line.player_name,
            market: bettingLinesService.getPropDisplayName(line.prop_type),
            line: line.line,
            betType: recommendation,
            hasConversation: false
          }
        })
      
      setAvailableLines(available)
    }
  }, [bettingLines, conversations])

  const getTrendingConversations = () => {
    return conversations
      .filter(conv => conv.isTrending)
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 7)
  }

  const getOtherConversations = () => {
    return conversations
      .filter(conv => !conv.isTrending)
      .sort((a, b) => new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - 
                      new Date(a.lastMessage?.timestamp || a.createdAt).getTime())
  }

  const getFilteredConversations = () => {
    const convs = activeTab === 'trending' ? getTrendingConversations() : getOtherConversations()
    
    if (!searchQuery) return convs
    
    return convs.filter(conv => 
      conv.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.market.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffMs = now.getTime() - messageTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)}h`
    return `${Math.floor(diffMins / (24 * 60))}d`
  }

  const startNewConversation = (line: PropLine) => {
    const newConversation: LineConversation = {
      id: `conv_${Date.now()}`,
      propId: line.propId,
      player: line.player,
      market: line.market,
      line: line.line,
      betType: line.betType,
      participants: 1,
      isTrending: false,
      createdAt: new Date().toISOString(),
      messages: []
    }
    
    setConversations(prev => [...prev, newConversation])
    setAvailableLines(prev => prev.filter(l => l.propId !== line.propId))
    setShowStartConversation(false)
    setSelectedConversation(newConversation)
    Alert.alert('Success', 'Conversation started! You can now chat about this line.')
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'current_user',
      username: 'You',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: message,
          participants: conv.participants + (conv.messages.length === 0 ? 0 : 1)
        }
      }
      return conv
    }))

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: message
    } : null)

    setNewMessage('')
  }

  const renderConversationItem = ({ item }: { item: LineConversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => setSelectedConversation(item)}
    >
      <View style={styles.conversationHeader}>
        <View style={styles.conversationInfo}>
          <Text style={styles.playerName}>{item.player}</Text>
          <Text style={styles.marketInfo}>
            {item.market} {item.line} {item.betType}
          </Text>
        </View>
        <View style={styles.conversationMeta}>
          <View style={styles.participantsIndicator}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.participantsText}>{item.participants}</Text>
          </View>
          {item.isTrending && (
            <View style={styles.trendingBadge}>
              <TrendingUp size={12} color={colors.primary} />
            </View>
          )}
        </View>
      </View>
      
      {item.lastMessage && (
        <View style={styles.lastMessage}>
          <Text style={styles.lastMessageUser}>{item.lastMessage.username}:</Text>
          <Text style={styles.lastMessageText} numberOfLines={1}>
            {item.lastMessage.message}
          </Text>
          <Text style={styles.lastMessageTime}>
            {formatTime(item.lastMessage.timestamp)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )

  const renderAvailableLineItem = ({ item }: { item: PropLine }) => (
    <TouchableOpacity 
      style={styles.availableLineItem}
      onPress={() => startNewConversation(item)}
    >
      <View style={styles.lineInfo}>
        <Text style={styles.playerName}>{item.player}</Text>
        <Text style={styles.marketInfo}>
          {item.market} {item.line} {item.betType}
        </Text>
      </View>
      <View style={styles.startChatButton}>
        <MessageCircle size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  )

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageItem,
      item.userId === 'current_user' && styles.ownMessage
    ]}>
      <Text style={styles.messageUser}>{item.username}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading betting lines...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>Discuss lines with the community</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lines or players..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => setActiveTab('trending')}
          >
            <TrendingUp size={16} color={activeTab === 'trending' ? colors.primary : colors.muted} />
            <Text style={[
              styles.tabText,
              activeTab === 'trending' && styles.activeTabText
            ]}>
              Trending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'other' && styles.activeTab]}
            onPress={() => setActiveTab('other')}
          >
            <MessageCircle size={16} color={activeTab === 'other' ? colors.primary : colors.muted} />
            <Text style={[
              styles.tabText,
              activeTab === 'other' && styles.activeTabText
            ]}>
              Other
            </Text>
          </TouchableOpacity>
        </View>

        {/* Start Conversation Button */}
        <TouchableOpacity
          style={styles.startConversationButton}
          onPress={() => setShowStartConversation(true)}
        >
          <Plus size={16} color={colors.background} />
          <Text style={styles.startConversationText}>Start a Conversation</Text>
        </TouchableOpacity>

        {/* Conversations List */}
        <FlatList
          data={getFilteredConversations()}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MessageCircle size={48} color={colors.muted} />
              <Text style={styles.emptyStateText}>
                {activeTab === 'trending' ? 'No trending conversations' : 'No other conversations'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Start a conversation to get the discussion going!
              </Text>
            </View>
          }
        />
      </View>

      {/* Start Conversation Modal (overlay) */}
      <Modal
        visible={showStartConversation}
        animationType="slide"
        transparent={true}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowStartConversation(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <SafeAreaView style={{flex: 1}}>
              <View style={styles.startModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Start a Conversation</Text>
                  <TouchableOpacity onPress={() => setShowStartConversation(false)}>
                    <Text style={styles.modalCloseButton}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSubtitle}>
                  Choose a line that doesn't have a conversation yet:
                </Text>
                
                <FlatList
                  data={availableLines}
                  renderItem={renderAvailableLineItem}
                  keyExtractor={(item) => item.propId}
                  style={styles.availableLinesList}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <MessageCircle size={48} color={colors.muted} />
                      <Text style={styles.emptyStateText}>No available lines</Text>
                      <Text style={styles.emptyStateSubtext}>
                        All lines currently have active conversations
                      </Text>
                    </View>
                  }
                />
              </View>
            </SafeAreaView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={!!selectedConversation}
        animationType="slide"
        transparent={true}
      >
        {selectedConversation && (
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedConversation(null)}
          >
            <TouchableOpacity 
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <SafeAreaView style={{flex: 1}}>
                <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedConversation.player}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedConversation.market} {selectedConversation.line} {selectedConversation.betType}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedConversation(null)}>
                <Text style={styles.modalCloseButton}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chatContainer}>
              <FlatList
                data={selectedConversation.messages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                style={styles.chatMessages}
                contentContainerStyle={styles.chatMessagesContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <MessageCircle size={48} color={colors.muted} />
                    <Text style={styles.emptyStateText}>No messages yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Be the first to share your thoughts on this line!
                    </Text>
                  </View>
                }
              />
            </View>

            <TouchableOpacity
              style={styles.viewAnalysisButton}
              onPress={() => {
                setSelectedConversation(null)
                // Navigate to LivePricing with relaxed typing for RN
                // @ts-ignore
                navigation.navigate('LivePricing', {
                  lineId: selectedConversation.propId,
                  lineData: { propId: selectedConversation.propId },
                })
              }}
            >
              <Text style={styles.viewAnalysisText}>View Analysis</Text>
            </TouchableOpacity>

            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message..."
                placeholderTextColor={colors.muted}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newMessage.trim() && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send size={16} color={newMessage.trim() ? colors.background : colors.muted} />
              </TouchableOpacity>
            </View>
              </SafeAreaView>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.base,
    color: colors.textSecondary,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.base,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: typography.sm,
    color: colors.muted,
    marginLeft: 6,
    fontWeight: typography.medium,
  },
  activeTabText: {
    color: colors.primary,
  },
  startConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  startConversationText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.background,
    marginLeft: 8,
  },
  // viewAnalysis styles are defined later in this file (single definition)
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conversationInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  marketInfo: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  trendingBadge: {
    padding: 4,
    backgroundColor: colors.primary + '20',
    borderRadius: 6,
  },
  lastMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastMessageUser: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.primary,
  },
  lastMessageText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  lastMessageTime: {
    fontSize: typography.xs,
    color: colors.muted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.muted,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: typography.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: 50, // Leave space for status bar
    marginBottom: 83, // Leave space for bottom tab navigation (standard height ~83px)
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  startModalContent: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + '40',
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 8,
  },
  chatContainer: {
    flex: 1,
    paddingTop: 16,
  },
  modalCloseButton: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  availableLinesList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  availableLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lineInfo: {
    flex: 1,
  },
  startChatButton: {
    padding: 8,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatMessagesContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  messageItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  ownMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  messageUser: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: typography.base,
    color: colors.text,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: typography.xs,
    color: colors.muted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.muted + '40',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 12,
  },
  sendButtonDisabled: {
    backgroundColor: colors.muted,
  },
  viewAnalysisButton: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginTop: 8,
    marginBottom: 12,
  },
  viewAnalysisText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
})
