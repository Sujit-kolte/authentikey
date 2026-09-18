import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import BuyerNavigator from "./BuyerNavigator";
import SellerNavigator from "./SellerNavigator";
import { colors } from "../theme/colors";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.cardBorder,
    primary: colors.primary,
  },
};
export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  return (
    <NavigationContainer theme={theme}>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === "seller" ? (
        <SellerNavigator />
      ) : (
        <BuyerNavigator />
      )}
    </NavigationContainer>
  );
}
