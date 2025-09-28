import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useState } from "react"
import AppNavigator from "./src/navigation/AppNavigator"
import WelcomeScreen from "./src/screens/WelcomeScreen"
import AuthModal from "./src/components/AuthModal"
import { useAppStore } from "./src/store/useAppStore"
import { colors } from "./src/theme/colors"

export default function App() {
  const { isAuthenticated } = useAppStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')

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
