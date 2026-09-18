import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  back: { color: colors.primary, fontWeight: "800", marginBottom: 22 },
  title: { color: colors.textPrimary, fontSize: 27, fontWeight: "900" },
  subtitle: { color: colors.textSecondary, marginTop: 7, lineHeight: 20 },
  status: {
    marginTop: 18,
    padding: 14,
    borderRadius: 11,
    backgroundColor: `${colors.primary}18`,
  },
  statusTitle: { color: colors.primary, fontWeight: "900" },
  statusText: { color: colors.textSecondary, marginTop: 5 },
  section: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    padding: 14,
    borderRadius: 11,
    backgroundColor: colors.surface,
    gap: 8,
  },
  line: { color: colors.textSecondary, lineHeight: 20 },
  problem: { color: colors.danger, marginTop: 8, lineHeight: 19 },
  linkButton: {
    minHeight: 48,
    marginTop: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  link: { color: colors.primary, fontWeight: "800" },
  media: {
    width: "100%",
    height: 190,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: colors.input,
  },
});
