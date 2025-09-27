import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { ImageBackground, StyleSheet } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from "./src/navigation/AppNavigator"
import { colors } from "./src/theme/colors"

export default function App() {
  return (
    <SafeAreaProvider>
      <ImageBackground 
        source={require('./assets/bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <AppNavigator />
      </ImageBackground>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
})
