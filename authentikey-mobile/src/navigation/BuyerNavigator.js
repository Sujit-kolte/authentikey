import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClipboardCheck, Home, LockKeyhole } from "lucide-react-native";
import AuditDashboardScreen from "../screens/buyer/AuditDashboardScreen";
import EscrowVaultScreen from "../screens/buyer/EscrowVaultScreen";
import BuyerFeedScreen from "../screens/buyer/BuyerFeedScreen";
import BuyerPropertyDetailScreen from "../screens/buyer/BuyerPropertyDetailScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Marketplace" component={BuyerFeedScreen} />
      <Stack.Screen
        name="BuyerPropertyDetailScreen"
        component={BuyerPropertyDetailScreen}
      />
      <Stack.Screen name="Audit" component={AuditDashboardScreen} />
      <Stack.Screen name="Escrow" component={EscrowVaultScreen} />
    </Stack.Navigator>
  );
}
export default function BuyerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.cardBorder,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tab.Screen
        name="Home"
        component={MarketplaceStack}
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Audit"
        component={AuditDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <ClipboardCheck size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Vault"
        component={EscrowVaultScreen}
        options={{
          tabBarIcon: ({ color }) => <LockKeyhole size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
