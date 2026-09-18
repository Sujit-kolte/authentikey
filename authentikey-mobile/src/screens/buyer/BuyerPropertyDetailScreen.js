import React from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CheckCircle2, MapPin, Phone, ShieldCheck } from "lucide-react-native";
import PropertyVideo from "../../components/PropertyVideo";
import CommonButton from "../../components/CommonButton";
import { openMapDirections } from "../../services/mapsHelper";
import { colors } from "../../theme/colors";
import styles from "./BuyerPropertyDetailScreen.styles";

const labels = { FLAT: "FLAT", HOUSE: "HOUSE", PLOT: "PLOT" };
const documentLabels = {
  INDEX_II: "Index II",
  TAX_RECEIPT: "Tax Receipt",
  "7_12_EXTRACT": "7/12 Extract",
  "7_12_SADBARA": "7/12 Satbara",
  LIGHT_BILL: "Light Bill",
};

export default function BuyerPropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;
  const seller = property.seller || {};
  const coordinates = property.coordinates || { latitude: 0, longitude: 0 };
  const isPlot = property.category === "PLOT";
  const media = Array.isArray(property.property_media)
    ? property.property_media
    : [];
  const priceLabel =
    property.transactionType === "RENT" ? " / month" : " total";
  const callSeller = () =>
    seller.phone
      ? Linking.openURL(`tel:${seller.phone}`)
      : Alert.alert("Contact unavailable");
  const openMaps = async () => {
    const opened = await openMapDirections(
      coordinates.latitude,
      coordinates.longitude,
      property.title,
    );
    if (!opened)
      Alert.alert(
        "Maps unavailable",
        "Could not open a maps application on this device.",
      );
  };
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back to properties
        </Text>
        <PropertyVideo
          thumbnailUri={property.thumbnailUri}
          duration={property.videoDuration}
          onPress={() =>
            Alert.alert(
              "Verified tour preview",
              "The property tour is securely attached to this listing and will be available in the verified viewing flow.",
            )
          }
        />
        {media
          .filter((item) => item.type === "image")
          .map((item, index) => (
            <Image
              key={`${item.url}-${index}`}
              source={{ uri: item.url }}
              style={styles.media}
            />
          ))}
        {media
          .filter((item) => item.type === "video")
          .map((item, index) => (
            <TouchableOpacity
              key={`${item.url}-${index}`}
              style={styles.mediaLink}
              onPress={() => Linking.openURL(item.url)}>
              <Text style={styles.mediaLinkText}>
                Play property video {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        {property.physical_proof_video_url && (
          <TouchableOpacity
            style={styles.mediaLink}
            onPress={() => Linking.openURL(property.physical_proof_video_url)}>
            <Text style={styles.mediaLinkText}>
              Play verified physical-presence video
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.location}>
          {property.locality}, {property.city}
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[styles.badge, { backgroundColor: `${colors.primary}22` }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {property.transactionType === "RENT" ? "FOR RENT" : "FOR SALE"}
            </Text>
          </View>
          <View
            style={[styles.badge, { backgroundColor: `${colors.warning}22` }]}>
            <Text style={[styles.badgeText, { color: colors.warning }]}>
              {labels[property.category]}
            </Text>
          </View>
        </View>
        <Text style={styles.price}>
          ₹{Number(property.price).toLocaleString("en-IN")}
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              fontWeight: "500",
            }}>
            {priceLabel}
          </Text>
        </Text>
        <View style={styles.grid}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Token amount</Text>
            <Text style={styles.statValue}>
              ₹{Number(property.tokenAmount).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              {isPlot ? "Plot area" : "Carpet area"}
            </Text>
            <Text style={styles.statValue}>
              {Number(property.carpetAreaSqFt).toLocaleString("en-IN")} sq.ft
            </Text>
          </View>
        </View>
        {isPlot && (
          <>
            <Text style={styles.section}>Plot boundary verification</Text>
            <View style={styles.card}>
              <Text style={styles.plotLine}>
                Survey / Gat Number: {property.surveyNumber}
              </Text>
              <Text style={styles.plotLine}>Land zone: {property.zone}</Text>
              <Text style={styles.plotStatus}>
                {property.plotBoundaries?.length === 4
                  ? "4-corner GPS boundary walk verified"
                  : "Boundary walk incomplete"}
              </Text>
            </View>
          </>
        )}
        {!isPlot && (
          <>
            <Text style={styles.section}>Home details</Text>
            <View style={styles.card}>
              <Text style={styles.plotLine}>
                {property.bhk || "Residential home"} ·{" "}
                {property.furnishing || "Furnishing not specified"}
              </Text>
              <Text style={styles.plotLine}>
                Document:{" "}
                {documentLabels[property.documentType] || property.documentType}
              </Text>
            </View>
          </>
        )}
        <Text style={styles.section}>Verified seller profile</Text>
        <View style={styles.card}>
          <View style={styles.sellerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {seller.name?.charAt(0) || "S"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <Text style={styles.verified}>
                {seller.isVerified
                  ? "DigiLocker Titleholder Verified"
                  : "Verification pending"}
              </Text>
            </View>
            <CheckCircle2 size={20} color={colors.safe} />
          </View>
          <Text style={styles.contact}>
            {seller.phone || "Phone protected"}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.contactButton} onPress={callSeller}>
              <Phone size={14} color={colors.primary} />
              <Text style={styles.contactText}>Call seller</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.section}>Physical location & navigation</Text>
        <View style={styles.card}>
          <Text style={styles.sellerName}>
            {property.locality}, {property.city}
          </Text>
          <Text style={styles.coordinates}>
            Verified GPS: {coordinates.latitude.toFixed(5)},{" "}
            {coordinates.longitude.toFixed(5)}
          </Text>
          <Text style={styles.note}>
            This location was captured from the seller device during
            verification.
          </Text>
          <View style={styles.mapButton}>
            <CommonButton
              title="Navigate in Google Maps / Apple Maps"
              onPress={openMaps}
              icon={MapPin}
            />
          </View>
        </View>
        <View style={styles.escrow}>
          <CommonButton
            title="Lock Token in Safe Escrow"
            onPress={() => navigation.navigate("Escrow")}
            icon={ShieldCheck}
          />
        </View>
      </ScrollView>
    </View>
  );
}
