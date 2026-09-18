import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 38 },
  back: { color: colors.primary, fontWeight: "800", marginBottom: 24 },
  title: { color: colors.textPrimary, fontSize: 27, fontWeight: "900" },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 26,
  },
  pipeline: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 20,
  },
  step: { flexDirection: "row", alignItems: "center", minHeight: 56 },
  rail: {
    width: 2,
    height: 24,
    backgroundColor: colors.cardBorder,
    marginLeft: 13,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBorder,
  },
  dotActive: { backgroundColor: colors.safe },
  stepTitle: { color: colors.textPrimary, fontWeight: "800", marginLeft: 14 },
  stepSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 14,
    marginTop: 3,
  },
  info: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
  },
  danger: { marginTop: 12 },
  qr: { backgroundColor: colors.primary, marginBottom: 12 },
  qrText: { color: colors.white, fontWeight: "800", textAlign: "center" },
});
