import { Linking, Platform } from "react-native";

export async function openMapDirections(
  latitude,
  longitude,
  label = "Property",
) {
  const encodedLabel = encodeURIComponent(label);
  const coordinateQuery =
    Platform.OS === "ios"
      ? `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`
      : `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`;
  const fallback =
    Platform.OS === "ios"
      ? `https://maps.apple.com/?q=${encodedLabel}&ll=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  try {
    if (await Linking.canOpenURL(coordinateQuery)) {
      await Linking.openURL(coordinateQuery);
      return true;
    }
    await Linking.openURL(fallback);
    return true;
  } catch {
    return false;
  }
}
