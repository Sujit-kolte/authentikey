import React from "react";
import { Text, View } from "react-native";
import { CheckCircle2, CircleAlert, ScanSearch } from "lucide-react-native";
import { colors } from "../theme/colors";
import styles from "./SignalCard.styles";

const icons = { safe: CheckCircle2, warning: CircleAlert, danger: CircleAlert };
export default function SignalCard({
  title,
  description,
  status,
  tone = "safe",
}) {
  const Icon = icons[tone] || ScanSearch;
  const color = colors[tone] || colors.safe;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
          <Text style={[styles.badgeText, { color }]}>{status}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
