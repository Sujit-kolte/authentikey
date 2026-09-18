import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { colors } from "../theme/colors";
import styles from "./PropertyCard.styles";

export default function PropertyCard({ property, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}>
      <Image
        source={{
          uri:
            property.thumbnailUri ||
            property.document_url ||
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900",
        }}
        style={styles.preview}
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.location}>
          {property.locality || property.address_text || "Location pending"} ·{" "}
          {property.bhk || property.category || "Verified home"}
        </Text>
        <View style={styles.row}>
          <Text style={styles.rent}>
            ₹{Number(property.price).toLocaleString("en-IN")}{" "}
            <Text style={styles.unit}>
              {property.transactionType === "RENT" ? "/ month" : "total"}
            </Text>
          </Text>
          <View style={styles.badge}>
            <CheckCircle2 size={13} color={colors.safe} />
            <Text style={styles.badgeText}>GPS Verified</Text>
          </View>
        </View>
        <View style={styles.risk}>
          <Text style={styles.riskText}>
            {property.riskScore ?? property.composite_risk_score ?? 0} / 100
            Risk
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
