import { create } from "zustand"
import type { PricingData, LiveStreamData, RadarItem } from "../types"

interface AppState {
  // Live data
  currentPricing: PricingData | null
  liveStream: LiveStreamData | null
  isConnected: boolean

  // Radar data
  radarItems: RadarItem[]

  // UI state
  showAlert: boolean
  alertData: {
    title: string
    subtitle: string
  } | null

  // Settings
  demoMode: boolean
  mispricingThreshold: number
  minConfidence: number

  // Actions
  setCurrentPricing: (pricing: PricingData) => void
  setLiveStream: (stream: LiveStreamData) => void
  setConnectionStatus: (connected: boolean) => void
  setRadarItems: (items: RadarItem[]) => void
  showAlertBanner: (title: string, subtitle: string) => void
  hideAlert: () => void
  toggleDemoMode: () => void
  updateSettings: (settings: Partial<Pick<AppState, "mispricingThreshold" | "minConfidence">>) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  currentPricing: null,
  liveStream: null,
  isConnected: false,
  radarItems: [],
  showAlert: false,
  alertData: null,
  demoMode: true, // Start in demo mode for hackathon
  mispricingThreshold: 0.05,
  minConfidence: 0.6,

  // Actions
  setCurrentPricing: (pricing) => set({ currentPricing: pricing }),
  setLiveStream: (stream) => set({ liveStream: stream }),
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  setRadarItems: (items) => set({ radarItems: items }),
  showAlertBanner: (title, subtitle) =>
    set({
      showAlert: true,
      alertData: { title, subtitle },
    }),
  hideAlert: () => set({ showAlert: false, alertData: null }),
  toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
}))
