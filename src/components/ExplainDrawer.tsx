"use client"

import React from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from "react-native"
import { X } from "lucide-react-native"
import { Chip } from "./ui/Chip"
import { Button } from "./ui/Button"
import type { ExplainProps } from "../types"
import { colors } from "../theme/colors"
import { typography } from "../theme/typography"

interface ExplainDrawerProps extends ExplainProps {
  visible: boolean
  onClose: () => void
}

const ExplainDrawer = ({
  visible,
  onClose,
  drivers,
  band,
  brier,
  windows,
  lastUpdate,
  onCounterfactual,
}: ExplainDrawerProps) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 150,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatImpact = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}`

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Why now</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Driver Chips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Drivers</Text>
              <View style={styles.driversContainer}>
                {drivers.slice(0, 3).map((driver, index) => (
                  <Chip
                    key={driver.name}
                    label={`${driver.name.charAt(0).toUpperCase() + driver.name.slice(1)} ${formatImpact(driver.impact)}`}
                    variant={driver.impact > 0 ? "positive" : "negative"}
                    onPress={() => onCounterfactual(`${driver.name}_${driver.impact > 0 ? "-10" : "+10"}`)}
                  />
                ))}
              </View>
            </View>

            {/* Counterfactual Toggles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What if scenarios</Text>
              <View style={styles.toggleContainer}>
                <Button
                  title="Pace -10%"
                  onPress={() => onCounterfactual("pace_-10")}
                  variant="outline"
                  size="sm"
                  style={styles.toggleButton}
                />
                <Button
                  title="Pace +10%"
                  onPress={() => onCounterfactual("pace_+10")}
                  variant="outline"
                  size="sm"
                  style={styles.toggleButton}
                />
              </View>
            </View>

            {/* Assumptions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assumptions</Text>
              <Text style={styles.assumptionText}>
                Windows: {windows.paceMin}m pace, {windows.minutesMin}m minutes
              </Text>
              <Text style={styles.assumptionText}>Updated: {lastUpdate}</Text>
            </View>

            {/* Confidence Band */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Confidence</Text>
              <Text style={styles.confidenceText}>
                90% band: {formatCurrency(band.lo)}–{formatCurrency(band.hi)}
              </Text>
              {brier && <Text style={styles.brierText}>Calibrated last 7d (Brier {brier.toFixed(2)})</Text>}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 34, // Safe area
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted + "20",
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 12,
  },
  driversContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  toggleButton: {
    flex: 1,
  },
  assumptionText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: typography.base,
    color: colors.text,
    fontVariant: ["tabular-nums"],
    marginBottom: 4,
  },
  brierText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
})

export { ExplainDrawer }
