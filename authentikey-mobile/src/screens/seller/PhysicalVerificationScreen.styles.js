import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  back: { color: colors.primary, fontWeight: "800", marginRight: 18 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "900" },
  subtitle: { color: colors.textSecondary, lineHeight: 20, marginBottom: 18 },
  camera: {
    height: 290,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: "flex-end",
  },
  cameraText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "800",
    backgroundColor: "#0009",
    padding: 12,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    gap: 10,
  },
  statusTitle: { color: colors.safe, fontWeight: "800" },
  statusText: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  notice: {
    color: colors.textSecondary,
    lineHeight: 19,
    fontSize: 13,
    marginTop: 18,
  },
  button: { marginTop: 20 },
});
