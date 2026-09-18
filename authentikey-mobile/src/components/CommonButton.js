import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import styles from "./CommonButton.styles";

export default function CommonButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon: Icon,
}) {
  const isSecondary = variant === "secondary";
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          {Icon && <Icon size={18} color={colors.white} />}
          <Text style={[styles.label, isSecondary && styles.secondaryLabel]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
