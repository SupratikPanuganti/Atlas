"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Activity, Radar, BarChart3, ArrowRight } from "lucide-react-native"
import { Button } from "../components/ui/Button"
import { useAppStore } from "../store/useAppStore"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface WelcomeScreenProps {
  onNavigateToLogin?: () => void
  onNavigateToSignup?: () => void
}

const { width } = Dimensions.get("window")

const features = [
  {
    icon: Activity,
    title: "Live Pricing Engine",
    description: "Real-time fair value calculations for sports props using advanced statistical models",
    color: colors.primary,
  },
  {
    icon: Radar,
    title: "Stale Line Detection",
    description: "Identify mispriced lines before the market corrects them",
    color: "#FF6B6B",
  },
  {
    icon: BarChart3,
    title: "Transparency First",
    description: "View calibration curves, Brier scores, and model performance metrics",
    color: "#4ECDC4",
  },
]

export default function WelcomeScreen({ onNavigateToLogin, onNavigateToSignup }: WelcomeScreenProps = {}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { login } = useAppStore()

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>EdgeBeacon</Text>
        <Text style={styles.tagline}>PrizePicks × Crypt of Data</Text>
      </View>

      {/* Feature Slides */}
      <View style={styles.slidesContainer}>
        <View style={styles.slideContent}>
          <View style={[styles.iconContainer, { backgroundColor: features[currentSlide].color + "20" }]}>
            {React.createElement(features[currentSlide].icon, { 
              size: 48, 
              color: features[currentSlide].color 
            })}
          </View>
          <Text style={styles.slideTitle}>{features[currentSlide].title}</Text>
          <Text style={styles.slideDescription}>{features[currentSlide].description}</Text>
        </View>

        {/* Slide Indicators */}
        <View style={styles.indicators}>
          {features.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentSlide && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentSlide > 0 && (
            <TouchableOpacity onPress={prevSlide} style={styles.navButton}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <View style={styles.navSpacer} />
          {currentSlide < features.length - 1 && (
            <TouchableOpacity onPress={nextSlide} style={styles.navButton}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Get Started"
          onPress={() => login("demo@edgebeacon.com", "demo123")}
          style={styles.primaryButton}
        />
        <Button
          title="Sign In"
          onPress={() => login("demo@edgebeacon.com", "demo123")}
          variant="outline"
          style={styles.secondaryButton}
        />

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Educational pricing tool • Not financial advice
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  slidesContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: typography.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted + "40",
  },
  indicatorActive: {
    backgroundColor: colors.primary,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  navButtonText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  navSpacer: {
    flex: 1,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 20,
  },
  demoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  demoLinkText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.medium,
    marginRight: 8,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
})
