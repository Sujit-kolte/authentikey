import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShieldCheck } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import CommonButton from "../../components/CommonButton";
import TextField from "../../components/TextField";
import { colors } from "../../theme/colors";
import styles from "./LoginScreen.styles";

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    try {
      await login(email, password);
    } catch (loginError) {
      const message =
        loginError?.message || "Please check your credentials and try again.";
      setError(message);
      Alert.alert("Sign in failed", message);
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled">
        <ShieldCheck size={36} color={colors.primary} />
        <Text style={styles.logo}>AuthentiKey</Text>
        <Text style={styles.tagline}>
          A calmer way to verify rentals before your money moves.
        </Text>
        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
        <CommonButton
          title="Sign in securely"
          onPress={submit}
          loading={isLoading}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to AuthentiKey? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.link}>Create account with OTP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
