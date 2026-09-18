import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
  },
  preview: { height: 150, backgroundColor: colors.input },
  body: { padding: 14 },
  title: { color: colors.textPrimary, fontSize: 16, fontWeight: "900" },
  location: { color: colors.textSecondary, fontSize: 13, marginTop: 5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },
  rent: { color: colors.textPrimary, fontSize: 16, fontWeight: "900" },
  unit: { color: colors.textSecondary, fontSize: 11, fontWeight: "500" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: `${colors.safe}20`,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: { color: colors.safe, fontSize: 10, fontWeight: "800" },
  risk: {
    alignSelf: "flex-start",
    backgroundColor: `${colors.safe}20`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 11,
  },
  riskText: { color: colors.safe, fontSize: 11, fontWeight: "800" },
});
