import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Activity, Radar, BarChart3, Eye, Settings } from "lucide-react-native"

import LiveScreen from "./src/screens/LiveScreen"
import RadarScreen from "./src/screens/RadarScreen"
import TransparencyScreen from "./src/screens/TransparencyScreen"
import WatchScreen from "./src/screens/WatchScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import { colors } from "./src/theme/colors"

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <SafeAreaProvider>
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
        <StatusBar style="light" backgroundColor={colors.surface} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let IconComponent

              switch (route.name) {
                case "Live":
                  IconComponent = Activity
                  break
                case "Radar":
                  IconComponent = Radar
                  break
                case "Transparency":
                  IconComponent = BarChart3
                  break
                case "Watch":
                  IconComponent = Eye
                  break
                case "Settings":
                  IconComponent = Settings
                  break
                default:
                  IconComponent = Activity
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
          <Tab.Screen name="Live" component={LiveScreen} />
          <Tab.Screen name="Radar" component={RadarScreen} />
          <Tab.Screen name="Transparency" component={TransparencyScreen} />
          <Tab.Screen name="Watch" component={WatchScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
