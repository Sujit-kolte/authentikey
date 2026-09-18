import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    gap: 10,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
  },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  description: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
