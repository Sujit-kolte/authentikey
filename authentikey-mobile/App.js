import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { PropertyProvider } from "./src/context/PropertyContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme/colors";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PropertyProvider>
          <StatusBar style="light" backgroundColor={colors.background} />
          <AppNavigator />
        </PropertyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
