import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { View, ActivityIndicator, Text, StyleSheet } from "react-native"
import AppNavigator from "./src/navigation/AppNavigator"
import WelcomeScreen from "./src/screens/WelcomeScreen"
import AuthModal from "./src/components/AuthModal"
import { useAppStore } from "./src/store/useAppStore"
import { colors } from "./src/theme/colors"
import { validateConfig } from "./src/config"

export default function App() {
  const { isAuthenticated, checkAuthStatus } = useAppStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [isLoading, setIsLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  // Check authentication status on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Validate configuration first
        const validation = validateConfig()
        if (!validation.isValid) {
          setConfigError(validation.errors.join('\n'))
          setIsLoading(false)
          return
        }
        
        await checkAuthStatus()
      } catch (error) {
        console.error('Failed to check auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [checkAuthStatus])

  // Show configuration error screen
  if (configError) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.surface} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Configuration Error</Text>
          <Text style={styles.errorText}>{configError}</Text>
          <Text style={styles.errorInstructions}>
            {'\n'}Please create a .env file in the root directory with:{'\n\n'}
            EXPO_PUBLIC_SUPABASE_URL=your_supabase_url{'\n'}
            EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key{'\n\n'}
            Then restart the app (press 'r' in the terminal).
          </Text>
        </View>
      </SafeAreaProvider>
    )
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.surface} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    )
  }

  // Show Welcome screen if not authenticated, otherwise show main app
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.surface} />
        <WelcomeScreen 
          onNavigateToLogin={() => {
            setAuthMode('login')
            setShowAuthModal(true)
          }}
          onNavigateToSignup={() => {
            setAuthMode('signup')
            setShowAuthModal(true)
          }}
        />
        <AuthModal 
          visible={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.surface} />
      <AppNavigator />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorInstructions: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'left',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
})
