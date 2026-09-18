import React from "react";
import { Text, View } from "react-native";
import { colors } from "../theme/colors";
import styles from "./RiskGauge.styles";

export default function RiskGauge({ score }) {
  const safe = score < 35;
  const warning = score < 70;
  const tone = safe ? colors.safe : warning ? colors.warning : colors.danger;
  const label = safe
    ? "LOW RISK - SAFE TO PROCEED"
    : warning
      ? "REVIEW BEFORE PAYING"
      : "HIGH RISK - STOP";
  return (
    <View style={styles.card}>
      <Text style={styles.label}>COMPOSITE RISK SCORE</Text>
      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: tone }]}>{score}</Text>
        <Text style={styles.max}>/ 100</Text>
      </View>
      <View style={[styles.tag, { backgroundColor: `${tone}22` }]}>
        <Text style={[styles.tagText, { color: tone }]}>{label}</Text>
      </View>
    </View>
  );
}
