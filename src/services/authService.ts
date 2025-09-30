import { supabase } from '../lib/supabase'

export const authService = {
  async checkEmailExists(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is what we want
      throw error
    }
    return !!data
  },

  async signUp(email: string, username: string, password: string) {
    // Check if email already exists in our users table
    const emailExists = await this.checkEmailExists(email)
    if (emailExists) {
      throw new Error('Email already registered')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: undefined // Disable email confirmation for demo
      }
    })
    if (error) {
      console.error('Signup error:', error)
      throw error
    }
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is okay for new users
      throw error
    }
    return data
  },

  async createUserProfile(userId: string, email: string, username: string) {
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single()
      
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already registered with another account')
      }
      
      // Use upsert to handle existing records
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email,
          username,
          password_hash: 'oauth_user', // For OAuth users
          credits: 1000
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }
      return data
    } catch (error) {
      console.error('Failed to create user profile:', error)
      throw error
    }
  }
}
