import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 40 },
  back: { color: colors.primary, fontWeight: "800", marginBottom: 28 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: "900" },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 24,
  },
  roleRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  role: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: "center" },
  roleActive: { backgroundColor: colors.primary },
  roleText: { color: colors.textSecondary, fontSize: 13, fontWeight: "800" },
  roleTextActive: { color: colors.white },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  footerText: { color: colors.textSecondary, fontSize: 13 },
  link: { color: colors.primary, fontWeight: "800", fontSize: 13 },
});
