import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Video } from "lucide-react-native";
import { colors } from "../../theme/colors";
import styles from "./SellerPropertyDetailScreen.styles";

export default function SellerPropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;
  const media = Array.isArray(property.property_media)
    ? property.property_media
    : [];
  const checks = property.verification_checks || {};
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back to listings
        </Text>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.subtitle}>{property.address_text}</Text>
        <View style={styles.status}>
          <Text style={styles.statusTitle}>
            {property.verification_status || "DRAFT"}
          </Text>
          <Text style={styles.statusText}>
            {property.is_verified
              ? "All verification checks passed"
              : "Verification needs attention"}
          </Text>
        </View>
        <Text style={styles.section}>Property details</Text>
        <View style={styles.card}>
          <Text style={styles.line}>
            Transaction: {property.transaction_type}
          </Text>
          <Text style={styles.line}>Category: {property.category}</Text>
          <Text style={styles.line}>
            Price: ₹{Number(property.price).toLocaleString("en-IN")}
          </Text>
          <Text style={styles.line}>
            Token: ₹{Number(property.token_amount).toLocaleString("en-IN")}
          </Text>
          <Text style={styles.line}>
            Area: {property.carpet_area_sqft || "Not provided"} sq.ft
          </Text>
          <Text style={styles.line}>
            Address GPS distance:{" "}
            {property.proof_address_distance_metres == null
              ? "Not checked"
              : `${Math.round(property.proof_address_distance_metres)}m`}
          </Text>
        </View>
        <Text style={styles.section}>Owner details</Text>
        <View style={styles.card}>
          <Text style={styles.line}>
            Name: {property.owner_name || "Missing"}
          </Text>
          <Text style={styles.line}>
            Phone: {property.owner_phone || "Missing"}
          </Text>
          <Text style={styles.line}>
            Email: {property.owner_email || "Not provided"}
          </Text>
          <Text style={styles.line}>
            ID / title reference: {property.owner_id_number || "Missing"}
          </Text>
        </View>
        <Text style={styles.section}>Verification checks</Text>
        <View style={styles.card}>
          {Object.keys(checks).length === 0 ? (
            <Text style={styles.line}>No verification result yet.</Text>
          ) : (
            Object.entries(checks).map(([key, passed]) => (
              <Text style={styles.line} key={key}>
                {passed ? "✓" : "!"} {key}:{" "}
                {passed ? "Passed" : "Needs attention"}
              </Text>
            ))
          )}
          {property.verification_issues?.length > 0 && (
            <Text style={styles.problem}>
              {property.verification_issues.join(" ")}
            </Text>
          )}
        </View>
        <Text style={styles.section}>Evidence</Text>
        <TouchableOpacity
          onPress={() =>
            property.document_url && Linking.openURL(property.document_url)
          }
          style={styles.linkButton}>
          <Text style={styles.link}>Open ownership document</Text>
        </TouchableOpacity>
        {property.physical_proof_video_url && (
          <TouchableOpacity
            onPress={() => Linking.openURL(property.physical_proof_video_url)}
            style={styles.linkButton}>
            <Video size={18} color={colors.primary} />
            <Text style={styles.link}>Open physical proof video</Text>
          </TouchableOpacity>
        )}
        {media.map((item, index) =>
          item.type === "image" ? (
            <Image
              key={`${item.url}-${index}`}
              source={{ uri: item.url }}
              style={styles.media}
            />
          ) : (
            <TouchableOpacity
              key={`${item.url}-${index}`}
              onPress={() => Linking.openURL(item.url)}
              style={styles.linkButton}>
              <Video size={18} color={colors.primary} />
              <Text style={styles.link}>Open property video {index + 1}</Text>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>
    </View>
  );
}
