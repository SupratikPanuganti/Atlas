import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useState, useEffect } from "react"
import { View, ActivityIndicator } from "react-native"
import AppNavigator from "./src/navigation/AppNavigator"
import WelcomeScreen from "./src/screens/WelcomeScreen"
import AuthModal from "./src/components/AuthModal"
import { useAppStore } from "./src/store/useAppStore"
import { colors } from "./src/theme/colors"

export default function App() {
  const { isAuthenticated, checkAuthStatus } = useAppStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuthStatus()
      } catch (error) {
        console.error('Failed to check auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [checkAuthStatus])

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
