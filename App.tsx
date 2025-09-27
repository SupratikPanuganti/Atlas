import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from "./src/navigation/AppNavigator"
import { colors } from "./src/theme/colors"

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.surface} />
      <AppNavigator />
    </SafeAreaProvider>
  )
}
