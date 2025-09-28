import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Eye, EyeOff, X } from "lucide-react-native"
import { Button } from "./ui/Button"
import { useAppStore } from "../store/useAppStore"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface AuthModalProps {
  visible: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({ visible, onClose, initialMode = 'signup' }: AuthModalProps) {
  const { login, signup } = useAppStore()
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Update mode when initialMode prop changes
    setIsLogin(initialMode === 'login')
  }, [initialMode])

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in email and password")
      return
    }

    if (!isLogin && !name) {
      Alert.alert("Error", "Please fill in your name")
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
      // Close modal after successful auth
      onClose()
    } catch (error) {
      Alert.alert("Authentication Failed", "Please try again")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setShowPassword(false)
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isLogin ? "Welcome Back" : "Join Atlas"}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {isLogin 
                ? "Sign in to access your dashboard" 
                : "Discover hidden lines with our community"
              }
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.muted} />
                    ) : (
                      <Eye size={20} color={colors.muted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title={loading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Create Account")}
                onPress={handleAuth}
                disabled={loading}
                style={styles.authButton}
                loading={loading}
              />

              {/* Social Login */}
              <View style={styles.socialSection}>
                <Text style={styles.socialTitle}>Or continue with</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={() => {
                      // Mock Google login - in real app, this would integrate with Google OAuth
                      setEmail("user@gmail.com")
                      setPassword("google123")
                      handleAuth()
                    }}
                  >
                    <View style={styles.googleIcon}>
                      <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.prizepicksButton}
                    onPress={() => {
                      // Mock PrizePicks login - in real app, this would integrate with PrizePicks OAuth
                      setEmail("user@prizepicks.com")
                      setPassword("prizepicks123")
                      handleAuth()
                    }}
                  >
                    <View style={styles.prizepicksIcon}>
                      <Text style={styles.prizepicksIconText}>P</Text>
                    </View>
                    <Text style={styles.prizepicksButtonText}>PrizePicks</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Toggle Mode */}
              <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                <Text style={styles.toggleText}>
                  {isLogin 
                    ? "Don't have an account? " 
                    : "Already have an account? "
                  }
                  <Text style={styles.toggleLink}>
                    {isLogin ? "Sign up" : "Sign in"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "20",
  },
  title: {
    fontSize: 24,
    fontWeight: typography.bold,
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: typography.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.muted + "30",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted + "30",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: typography.base,
    color: colors.text,
  },
  eyeButton: {
    padding: 14,
  },
  authButton: {
    marginTop: 8,
  },
  socialSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.muted + "20",
    alignItems: "center",
  },
  socialTitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  googleButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  googleButtonText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: "#3C4043",
  },
  prizepicksButton: {
    flex: 1,
    backgroundColor: "#6B46C1",
    borderWidth: 1,
    borderColor: "#6B46C1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  prizepicksIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  prizepicksIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  prizepicksButtonText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: "#FFFFFF",
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  toggleText: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  toggleLink: {
    color: colors.primary,
    fontWeight: typography.medium,
  },
})
