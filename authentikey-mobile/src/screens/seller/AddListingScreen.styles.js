import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 36 },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { color: colors.textPrimary, fontSize: 27, fontWeight: "900" },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 22,
  },
  field: { marginBottom: 15 },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  area: { minHeight: 90, textAlignVertical: "top", paddingTop: 14 },
  hint: {
    color: colors.textSecondary,
    lineHeight: 19,
    fontSize: 13,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
});
