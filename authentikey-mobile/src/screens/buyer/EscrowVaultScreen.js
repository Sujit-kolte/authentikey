import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Check, QrCode, ShieldAlert } from "lucide-react-native";
import CommonButton from "../../components/CommonButton";
import { colors } from "../../theme/colors";
import styles from "./EscrowVaultScreen.styles";

const steps = [
  ["Deposit Locked", "Funds held safely"],
  ["On-site Visit", "Waiting for property visit"],
  ["Key Handover", "QR handshake required"],
  ["Released", "Funds sent to landlord"],
];
export default function EscrowVaultScreen({ navigation }) {
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back to audit</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Micro-Escrow Vault</Text>
        <Text style={styles.subtitle}>
          Your advance stays locked until the right real-world event proves the
          rental is genuine.
        </Text>
        <View style={styles.pipeline}>
          {steps.map(([title, sub], index) => (
            <React.Fragment key={title}>
              <View style={styles.step}>
                <View style={[styles.dot, index === 0 && styles.dotActive]}>
                  {index === 0 && <Check size={16} color="#052e16" />}
                </View>
                <View>
                  <Text style={styles.stepTitle}>{title}</Text>
                  <Text style={styles.stepSub}>{sub}</Text>
                </View>
              </View>
              {index < steps.length - 1 && <View style={styles.rail} />}
            </React.Fragment>
          ))}
          <Text style={styles.info}>
            Escrow cancellation is available before key handover. A clear audit
            trail is created for every state change.
          </Text>
        </View>
        <CommonButton
          title="Generate On-Site Release QR"
          onPress={() =>
            Alert.alert(
              "QR ready",
              "Show this one-time QR code to the verified landlord on site.",
            )
          }
          icon={QrCode}
        />
        <View style={styles.danger}>
          <CommonButton
            title="One-Tap Scam Cancellation / Refund"
            variant="danger"
            onPress={() =>
              Alert.alert(
                "Cancellation started",
                "Your refund request has been recorded.",
              )
            }
            icon={ShieldAlert}
          />
        </View>
      </ScrollView>
    </View>
  );
}
