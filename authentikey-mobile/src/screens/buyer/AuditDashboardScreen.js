import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowRight, LogOut, ShieldCheck } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import CommonButton from "../../components/CommonButton";
import RiskGauge from "../../components/RiskGauge";
import SignalCard from "../../components/SignalCard";
import { colors } from "../../theme/colors";
import styles from "./AuditDashboardScreen.styles";

const signals = [
  [
    "Image Authenticity",
    "No duplicate perceptual hashes found across Airbnb or 99acres.",
    "Passed",
    "safe",
  ],
  [
    "Market Rent Anomaly",
    "Asking rent is within 8% of the local area median for this property type.",
    "Normal",
    "safe",
  ],
  [
    "Identity & Title Deed OCR Match",
    "Aadhaar name and municipal tax receipt show a 92% fuzzy match.",
    "92% Match",
    "warning",
  ],
];
export default function AuditDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [listing, setListing] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    if (!listing.trim()) {
      Alert.alert(
        "Add a listing",
        "Paste a URL or WhatsApp excerpt to analyze.",
      );
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setAnalyzed(true);
    setLoading(false);
  };
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>TENANT PROTECTION</Text>
            <Text style={styles.title}>
              Hello, {user?.name?.split(" ")[0] || "Tenant"}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={logout}>
            <LogOut size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.intro}>
          Run a fast fraud audit before you send a deposit. Links and chat
          excerpts stay attached to this verification.
        </Text>
        <TextInput
          value={listing}
          onChangeText={setListing}
          placeholder="Paste rental URL or WhatsApp chat excerpt..."
          placeholderTextColor={colors.muted}
          multiline
          style={styles.input}
        />
        <CommonButton
          title={analyzed ? "Re-analyze listing" : "Analyze listing"}
          onPress={analyze}
          loading={loading}
          icon={ShieldCheck}
        />
        {!analyzed ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Your risk report will appear here with image, price, and identity
              signals.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.section}>Verification report</Text>
            <RiskGauge score={18} />
            <Text style={styles.section}>Signals checked</Text>
            {signals.map(([title, description, status, tone]) => (
              <SignalCard
                key={title}
                title={title}
                description={description}
                status={status}
                tone={tone}
              />
            ))}
            <TouchableOpacity
              style={styles.escrow}
              onPress={() => navigation.navigate("Escrow")}>
              <ShieldCheck size={24} color="#052e16" />
              <View style={{ flex: 1 }}>
                <Text style={styles.escrowTitle}>
                  Lock advance in Micro-Escrow
                </Text>
                <Text style={styles.escrowText}>
                  Release funds only after the physical QR handshake.
                </Text>
              </View>
              <ArrowRight size={20} color="#052e16" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
