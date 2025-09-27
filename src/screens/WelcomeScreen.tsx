"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native"
import { PanGestureHandler, State } from "react-native-gesture-handler"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { SafeAreaView } from "react-native-safe-area-context"
import { Activity, Users, MessageSquare, ArrowRight, Sparkles } from "lucide-react-native"
import { Button } from "../components/ui/Button"
import { useAppStore } from "../store/useAppStore"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface WelcomeScreenProps {
  onNavigateToLogin?: () => void
  onNavigateToSignup?: () => void
}

const { width, height } = Dimensions.get("window")

const features = [
  {
    icon: Activity,
    title: "Smart Line Detection",
    description: "Advanced algorithms detect mispriced betting lines in real-time, giving you the edge before markets adjust",
    color: "#00FF88",
    gradient: ["#00FF88", "#00CC6A"],
  },
  {
    icon: Users,
    title: "Head-to-Head Betting",
    description: "Create custom lines and match with other players using our innovative peer-to-peer betting platform",
    color: "#FF6B6B",
    gradient: ["#FF6B6B", "#FF4444"],
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Get instant insights, analysis, and betting advice from our advanced AI-powered chat system",
    color: "#4ECDC4",
    gradient: ["#4ECDC4", "#3BB5B0"],
  },
]

export default function WelcomeScreen({ onNavigateToLogin, onNavigateToSignup }: WelcomeScreenProps = {}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { login } = useAppStore()

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const sparkleAnim = useRef(new Animated.Value(0)).current
  
  // Pan gesture values
  const translateX = useRef(new Animated.Value(0)).current
  const panRef = useRef(null)

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Continuous sparkle animation
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    )
    sparkleLoop.start()

    return () => sparkleLoop.stop()
  }, [])

  useEffect(() => {
    // Smooth slide transition animation
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: -currentSlide * width,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: currentSlide * 0.05,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [currentSlide])

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  )

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent
      
      // More sensitive swipe detection with better thresholds
      const swipeThreshold = width * 0.2
      const velocityThreshold = 300
      
      if (Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > velocityThreshold) {
        if (translationX > 0 && currentSlide > 0) {
          // Swipe right - go to previous slide
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setCurrentSlide(currentSlide - 1)
        } else if (translationX < 0 && currentSlide < features.length - 1) {
          // Swipe left - go to next slide
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setCurrentSlide(currentSlide + 1)
        } else {
          // Reset to current slide
          Animated.spring(translateX, {
            toValue: -currentSlide * width,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start()
        }
      } else {
        // Reset to current slide with smooth animation
        Animated.spring(translateX, {
          toValue: -currentSlide * width,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start()
      }
    }
  }

  const sparkleRotation = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  })

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={['#000000', '#001a0d', '#003d1a', '#000000']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Sparkles */}
        <Animated.View
          style={[
            styles.floatingSparkles,
            {
              transform: [
                { rotate: sparkleRotation },
                { scale: sparkleScale },
              ],
            },
          ]}
        >
          <Sparkles size={24} color="#00FF88" />
        </Animated.View>

        {/* Header with Entrance Animation */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Text style={styles.logo}>Atlas</Text>
        <Text style={styles.tagline}>PrizePicks × Crypt of Data</Text>
        </Animated.View>

        {/* Swipeable Feature Slides */}
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.slidesContainer,
              {
                transform: [
                  { translateX },
                  { rotateY: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '5deg'],
                  }) },
                ],
              },
            ]}
          >
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.slide,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
        <View style={styles.slideContent}>
                  {/* Animated Icon Container */}
                  <Animated.View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: feature.color + "15",
                        borderColor: feature.color + "30",
                        transform: [
                          {
                            rotate: sparkleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '10deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={feature.gradient as [string, string]}
                      style={styles.iconGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {React.createElement(feature.icon, { 
              size: 48, 
                        color: "#FFFFFF" 
            })}
                    </LinearGradient>
                  </Animated.View>

                  <Text style={styles.slideTitle}>{feature.title}</Text>
                  <Text style={styles.slideDescription}>{feature.description}</Text>
          </View>
              </Animated.View>
            ))}
          </Animated.View>
        </PanGestureHandler>

        {/* Enhanced Indicators */}
        <View style={styles.indicators}>
          {features.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.indicator,
                index === currentSlide && styles.indicatorActive,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      scale: index === currentSlide ? 
                        scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }) : 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

      </LinearGradient>

      {/* Action Buttons with Enhanced Styling */}
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => login("demo@atlas.com", "demo123")}
        >
          <LinearGradient
            colors={['#00FF88', '#00CC6A'] as [string, string]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight size={20} color="#000000" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => login("demo@atlas.com", "demo123")}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradientBackground: {
    flex: 1,
    position: "relative",
  },
  floatingSparkles: {
    position: "absolute",
    top: 100,
    right: 30,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    zIndex: 5,
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#00FF88",
    marginBottom: 8,
    textShadowColor: "#00FF88",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    letterSpacing: 1,
  },
  slidesContainer: {
    flex: 1,
    flexDirection: "row",
    width: width * features.length,
  },
  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    borderWidth: 2,
    shadowColor: "#00FF88",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  slideDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
    paddingHorizontal: 20,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    gap: 12,
    paddingHorizontal: 20,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: "transparent",
  },
  indicatorActive: {
    backgroundColor: "#00FF88",
    borderColor: "#FFFFFF",
    shadowColor: "#00FF88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  actionsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#00FF88",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 1,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#00FF88",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00FF88",
    letterSpacing: 1,
  },
})
