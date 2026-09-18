import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Play } from "lucide-react-native";
import { colors } from "../theme/colors";
import styles from "./PropertyVideo.styles";

const fallbackImage =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

export default function PropertyVideo({
  thumbnailUri,
  duration = "01:24",
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Preview verified property tour">
      <Image
        source={{ uri: thumbnailUri || fallbackImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.scrim} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AUTHENTIKEY VERIFIED TOUR</Text>
      </View>
      <View style={styles.playButton}>
        <Play size={28} color={colors.primary} fill={colors.primary} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap to preview property tour</Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>
    </TouchableOpacity>
  );
}
