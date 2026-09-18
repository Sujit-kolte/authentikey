import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Camera, Home } from "lucide-react-native";
import SellerMyListingsScreen from "../screens/seller/SellerMyListingsScreen";
import SellerPropertyDetailScreen from "../screens/seller/SellerPropertyDetailScreen";
import AddPropertyScreen from "../screens/seller/AddPropertyScreen";
import PhysicalVerificationScreen from "../screens/seller/PhysicalVerificationScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SellerListingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SellerHomeScreen"
        component={SellerMyListingsScreen}
      />
      <Stack.Screen name="AddPropertyScreen" component={AddPropertyScreen} />
      <Stack.Screen
        name="SellerPropertyDetailScreen"
        component={SellerPropertyDetailScreen}
      />
    </Stack.Navigator>
  );
}

export default function SellerNavigator() {
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
        name="Listing"
        component={SellerListingsStack}
        options={{
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Verify"
        component={PhysicalVerificationScreen}
        options={{
          title: "Proof of Presence",
          tabBarIcon: ({ color }) => <Camera size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
