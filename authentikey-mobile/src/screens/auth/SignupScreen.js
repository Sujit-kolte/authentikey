import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CommonButton from "../../components/CommonButton";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import styles from "./SignupScreen.styles";

export default function SignupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signup, verifyOtp, requestOtp, isLoading } = useAuth();
  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    const normalizedPhone = phone.trim();
    if (
      !name.trim() ||
      !email.trim() ||
      password.length < 6 ||
      !/^\+[1-9]\d{7,14}$/.test(normalizedPhone)
    ) {
      setError(
        "Complete your name, email, password, and phone number in international format.",
      );
      return;
    }
    try {
      if (!otpSent) {
        await signup({
          name: name.trim(),
          email,
          password,
          phone: normalizedPhone,
          role,
        });
        setOtpSent(true);
        return;
      }
      if (!/^\d{6}$/.test(otp.trim())) {
        setError("Enter the 6-digit OTP sent to your phone.");
        return;
      }
      await verifyOtp(normalizedPhone, otp.trim(), {
        name: name.trim(),
        email,
        password,
        role,
      });
    } catch (signupError) {
      setError(signupError.message || "Unable to verify your phone number.");
    }
  };

  const resend = async () => {
    setError("");
    try {
      await requestOtp(
        phone.trim(),
        {
          full_name: name.trim(),
          phone: phone.trim(),
          role: role === "seller" ? "SELLER" : "BUYER",
        },
        true,
      );
    } catch (resendError) {
      setError(resendError.message || "Unable to resend the OTP.");
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create your shield</Text>
        <Text style={styles.subtitle}>
          Create your account with the previous details, then verify your mobile
          number with an OTP.
        </Text>
        <View style={styles.roleRow}>
          {[
            ["buyer", "Tenant"],
            ["seller", "Landlord"],
          ].map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[styles.role, role === value && styles.roleActive]}
              onPress={() => setRole(value)}>
              <Text
                style={[
                  styles.roleText,
                  role === value && styles.roleTextActive,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextField
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          error={error}
          editable={!otpSent}
        />
        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!otpSent}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          editable={!otpSent}
        />
        <TextField
          label="Mobile number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          editable={!otpSent}
        />
        {otpSent && (
          <>
            <TextField
              label="SMS OTP"
              value={otp}
              onChangeText={setOtp}
              placeholder="6-digit code"
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity onPress={resend}>
              <Text style={styles.link}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}
        <CommonButton
          title={otpSent ? "Verify and enter AuthentiKey" : "Send SMS OTP"}
          onPress={submit}
          loading={isLoading}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Sign in with email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
