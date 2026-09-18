import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default StyleSheet.create({
  field: { marginBottom: 15 },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  errorInput: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 11, marginTop: 5 },
});
