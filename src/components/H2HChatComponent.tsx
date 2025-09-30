import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Send, MessageCircle } from 'lucide-react-native'
import { chatService } from '../services/chatService'
import { useAppStore } from '../store/useAppStore'
import type { ChatMessage, LineConversation } from '../types'
import { colors } from '../theme/colors'
import { typography } from '../theme/typography'

interface H2HChatComponentProps {
  lineId: string
  onClose?: () => void
}

export const H2HChatComponent: React.FC<H2HChatComponentProps> = ({ lineId, onClose }) => {
  const { user } = useAppStore()
  const [conversation, setConversation] = useState<LineConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // Load conversation on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true)
        const conv = await chatService.getLineConversation(lineId)
        setConversation(conv)
        setMessages(conv.messages || [])
      } catch (error) {
        console.error('Failed to load conversation:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [lineId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !conversation || sending) return

    try {
      setSending(true)
      const messageText = newMessage.trim()
      setNewMessage('')

      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        userId: user.id,
        username: user.name,
        message: messageText,
        timestamp: new Date().toISOString(),
        type: 'user'
      }

      setMessages(prev => [...prev, userMessage])

      // Send message and get AI response
      const sentMessage = await chatService.sendMessage(
        conversation.id,
        user.id,
        user.name,
        messageText
      )

      // Get updated messages (including AI response)
      const updatedMessages = await chatService.getConversationMessages(conversation.id)
      setMessages(updatedMessages)

    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== `temp_${Date.now()}`))
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MessageCircle size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Line Chat</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Line Info */}
      {conversation && (
        <View style={styles.lineInfo}>
          <Text style={styles.lineInfoText}>
            {conversation.player} - {conversation.prop} {conversation.line} {conversation.betType}
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>Start a conversation about this line!</Text>
            <Text style={styles.emptyStateSubtext}>
              Ask questions about the player, prop, or get betting insights.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.aiMessage
              ]}
            >
              <View style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.aiBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.message}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.type === 'user' ? styles.userMessageTime : styles.aiMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
        {sending && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={[styles.messageText, styles.aiMessageText]}>
                AI is typing...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about this line..."
          placeholderTextColor={colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  lineInfo: {
    padding: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    ...typography.heading3,
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.body,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.text,
  },
  messageTime: {
    ...typography.caption,
    marginTop: 4,
  },
  userMessageTime: {
    color: colors.white,
    opacity: 0.8,
  },
  aiMessageTime: {
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
})
