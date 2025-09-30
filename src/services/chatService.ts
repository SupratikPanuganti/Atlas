import { databaseService } from './databaseService'
import { openaiService } from './openaiService'
import type { ChatMessage, LineConversation } from '../types'

export const chatService = {
  // Get or create a conversation for a specific H2H line
  async getLineConversation(lineId: string): Promise<LineConversation> {
    try {
      // Try to get existing conversation from database
      const { data: existingConversation, error } = await databaseService.supabase
        .from('line_conversations')
        .select('*')
        .eq('line_id', lineId)
        .single()

      if (existingConversation && !error) {
        // Get messages for this conversation
        const messages = await this.getConversationMessages(existingConversation.id)
        return {
          id: existingConversation.id,
          lineId: lineId,
          player: existingConversation.player_name || 'Player',
          prop: existingConversation.prop_type || 'Unknown Prop',
          line: existingConversation.line_value || 0,
          betType: existingConversation.bet_type || 'over',
          hasConversation: true,
          messages
        }
      }

      // Create new conversation if none exists
      const lineData = await databaseService.getH2HLineById(lineId)
      if (!lineData) {
        throw new Error('H2H line not found')
      }

      const newConversation = await this.createLineConversation(lineId, lineData)
      return newConversation

    } catch (error) {
      console.error('Failed to get line conversation:', error)
      // Return basic conversation structure
      return {
        id: `conv_${lineId}`,
        lineId: lineId,
        player: 'Player',
        prop: 'Unknown Prop',
        line: 0,
        betType: 'over',
        hasConversation: false,
        messages: []
      }
    }
  },

  // Create a new conversation for a line
  async createLineConversation(lineId: string, lineData: any): Promise<LineConversation> {
    try {
      const { data, error } = await databaseService.supabase
        .from('line_conversations')
        .insert({
          line_id: lineId,
          player_name: lineData.player?.name || 'Player',
          prop_type: lineData.prop_type || 'passing_yards',
          line_value: lineData.custom_line || 0,
          bet_type: lineData.side || 'over',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        lineId: lineId,
        player: data.player_name,
        prop: data.prop_type,
        line: data.line_value,
        betType: data.bet_type,
        hasConversation: true,
        messages: []
      }
    } catch (error) {
      console.error('Failed to create line conversation:', error)
      throw error
    }
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await databaseService.supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return data.map(msg => ({
        id: msg.id,
        userId: msg.user_id,
        username: msg.username || 'User',
        message: msg.message,
        timestamp: msg.created_at,
        type: msg.message_type || 'user'
      }))
    } catch (error) {
      console.error('Failed to get conversation messages:', error)
      return []
    }
  },

  // Send a message in a conversation
  async sendMessage(conversationId: string, userId: string, username: string, message: string): Promise<ChatMessage> {
    try {
      // Insert user message
      const { data: userMessage, error: userError } = await databaseService.supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          username: username,
          message: message,
          message_type: 'user',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (userError) throw userError

      // Generate AI response
      const aiResponse = await this.generateAIResponse(conversationId, message)

      // Insert AI response
      const { data: aiMessage, error: aiError } = await databaseService.supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: 'ai',
          username: 'AI Assistant',
          message: aiResponse,
          message_type: 'ai',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (aiError) throw aiError

      return {
        id: userMessage.id,
        userId: userId,
        username: username,
        message: message,
        timestamp: userMessage.created_at,
        type: 'user'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },

  // Generate AI response for a conversation
  async generateAIResponse(conversationId: string, userMessage: string): Promise<string> {
    try {
      // Get conversation context
      const conversation = await this.getConversationById(conversationId)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Get recent messages for context
      const recentMessages = await this.getConversationMessages(conversationId)
      const lastMessages = recentMessages.slice(-5) // Last 5 messages for context

      // Create context string
      const context = `
Line Details:
- Player: ${conversation.player}
- Prop: ${conversation.prop}
- Line: ${conversation.line}
- Bet Type: ${conversation.betType}

Recent Conversation:
${lastMessages.map(msg => `${msg.username}: ${msg.message}`).join('\n')}
`

      // Generate response using OpenAI
      const response = await openaiService.generateChatResponse(userMessage, context)
      return response

    } catch (error) {
      console.error('Failed to generate AI response:', error)
      return "I'm sorry, I'm having trouble responding right now. Please try again later."
    }
  },

  // Get conversation by ID
  async getConversationById(conversationId: string): Promise<any> {
    try {
      const { data, error } = await databaseService.supabase
        .from('line_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to get conversation by ID:', error)
      return null
    }
  },

  // Get all conversations for a user
  async getUserConversations(userId: string): Promise<LineConversation[]> {
    try {
      // This would require a more complex query to get conversations where user has messages
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get user conversations:', error)
      return []
    }
  },

  // Create tables if they don't exist (for development)
  async createTablesIfNotExist(): Promise<void> {
    try {
      // Create line_conversations table
      await databaseService.supabase.rpc('create_line_conversations_table_if_not_exists')
      
      // Create chat_messages table
      await databaseService.supabase.rpc('create_chat_messages_table_if_not_exists')
    } catch (error) {
      console.log('Tables may already exist or need to be created manually:', error)
    }
  }
}
