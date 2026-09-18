import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 8,
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.55 },
  label: { color: colors.white, fontSize: 15, fontWeight: "800" },
  secondaryLabel: { color: colors.textPrimary },
});
