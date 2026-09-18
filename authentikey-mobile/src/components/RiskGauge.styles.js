import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
    alignItems: "center",
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  scoreRow: { flexDirection: "row", alignItems: "baseline" },
  score: { fontSize: 58, fontWeight: "900" },
  max: { color: colors.muted, fontSize: 17, fontWeight: "700", marginLeft: 4 },
  tag: {
    marginTop: 8,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagText: { fontSize: 12, fontWeight: "800" },
});
