"use client"

import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Radar, Settings, Home, Eye } from "lucide-react-native"
import type { MainTabParamList, RootStackParamList } from "../types/navigation"

import { useAppStore } from "../store/useAppStore"
import { colors } from "../theme/colors"

// Screens
import WelcomeScreen from "../screens/WelcomeScreen"
import HomeScreen from "../screens/HomeScreen"
import LiveScreen from "../screens/LiveScreen"
import RadarScreen from "../screens/RadarScreen"
import TransparencyScreen from "../screens/TransparencyScreen"
import WatchScreen from "../screens/WatchScreen"
import SettingsScreen from "../screens/SettingsScreen"

const Tab = createBottomTabNavigator<MainTabParamList>()
const Stack = createStackNavigator<RootStackParamList>()

// Main App Tabs
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent

          switch (route.name) {
            case "Home":
              IconComponent = Home
              break
            case "Radar":
              IconComponent = Radar
              break
            case "Watch":
              IconComponent = Eye
              break
            default:
              IconComponent = Home
          }

          return <IconComponent size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.muted,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Radar" 
        component={RadarScreen}
        options={{ title: "Stale Lines" }}
      />
      <Tab.Screen 
        name="Watch" 
        component={WatchScreen}
        options={{ title: "Watch" }}
      />
    </Tab.Navigator>
  )
}

// Authentication Screen
function AuthScreen() {
  return <WelcomeScreen />
}

// Root Stack Navigator
function RootStackNavigator() {
  const { isAuthenticated } = useAppStore()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="LivePricing" 
            component={LiveScreen}
            options={{ title: "Live Pricing" }}
          />
          <Stack.Screen 
            name="Transparency" 
            component={TransparencyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="WatchMode" 
            component={WatchScreen}
            options={{ title: "Watch Mode" }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: "Settings" }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  )
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.surface,
          card: colors.card,
          text: colors.text,
          border: colors.muted,
          notification: colors.primary,
        },
      }}
    >
      <RootStackNavigator />
    </NavigationContainer>
  )
}
