"use client"

import React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Bell, Info, Smartphone } from "lucide-react-native"
import { Card } from "../components/ui/Card"
import { Slider } from "../components/ui/Slider"
import { Button } from "../components/ui/Button"
import { useAppStore } from "../store/useAppStore"
import { useNavigation } from "@react-navigation/native"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"
import { FadeInView, SlideInView } from "../components/animations"

export default function SettingsScreen() {
  const { mispricingThreshold, minConfidence, updateSettings, showAlertBanner, logout, user } =
    useAppStore()
  const navigation = useNavigation()

  const [snoozeDuration, setSnoozeDuration] = React.useState(10)

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout },
      ]
    )
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`
  const formatMinutes = (value: number) => `${value}m`

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Account Info Section */}
        <SlideInView delay={0} direction="up" duration={600}>
          <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Account Info</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{user?.name || "Demo User"}</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{user?.email || "demo@atlas.com"}</Text>
          </View>

          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            size="sm"
            style={styles.logoutButton}
          />
        </Card>
        </SlideInView>


        {/* Alert Settings */}
        <FadeInView delay={300} duration={600}>
          <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Alert Settings</Text>
          </View>

          <Slider
            label="Mispricing Threshold"
            value={mispricingThreshold}
            min={0.01}
            max={0.2}
            step={0.01}
            onValueChange={(value) => updateSettings({ mispricingThreshold: value })}
            formatValue={formatCurrency}
          />

          <Slider
            label="Min Confidence (p_fair)"
            value={minConfidence}
            min={0.5}
            max={0.95}
            step={0.05}
            onValueChange={(value) => updateSettings({ minConfidence: value })}
            formatValue={formatPercent}
          />

          <Slider
            label="Snooze Duration"
            value={snoozeDuration}
            min={5}
            max={60}
            step={5}
            onValueChange={setSnoozeDuration}
            formatValue={formatMinutes}
          />
        </Card>

        </FadeInView>

        {/* About Section */}
        <FadeInView delay={600} duration={600}>
          <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0 (HackGT Build)</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Team</Text>
            <Text style={styles.aboutValue}>Atlas</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Built for</Text>
            <Text style={styles.aboutValue}>PrizePicks Challenge</Text>
          </View>

          <TouchableOpacity style={styles.linkRow}>
            <Smartphone size={16} color={colors.primary} />
            <Text style={styles.linkText}>View on GitHub</Text>
          </TouchableOpacity>
        </Card>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "20",
  },
  aboutLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  aboutValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  linkText: {
    fontSize: typography.base,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: typography.medium,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "20",
  },
  profileLabel: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  profileValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  logoutButton: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
})
