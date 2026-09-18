import React from "react";
import { Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import styles from "./TextField.styles";

export default function TextField({ label, error, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.errorInput]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
