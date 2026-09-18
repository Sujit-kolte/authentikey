import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import CommonButton from "../../components/CommonButton";
import { colors } from "../../theme/colors";
import styles from "./AddListingScreen.styles";

export default function AddListingScreen() {
  const [form, setForm] = useState({
    title: "",
    rent: "",
    location: "",
    details: "",
  });
  const update = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = () => {
    if (!form.title || !form.rent || !form.location) {
      Alert.alert("Missing details", "Add a title, rent, and location.");
      return;
    }
    Alert.alert(
      "Listing saved",
      "Your listing is ready for tenant verification.",
    );
  };
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>LANDLORD WORKSPACE</Text>
        <Text style={styles.title}>Add a verified listing</Text>
        <Text style={styles.subtitle}>
          Make your property easier to trust by pairing it with an on-site proof
          session.
        </Text>
        <Text style={styles.hint}>
          Never ask a tenant to pay before they can verify the property in
          person. AuthentiKey can hold an advance until that moment.
        </Text>
        {[
          ["title", "Listing title", "e.g. 2BHK near Indiranagar"],
          ["rent", "Monthly rent", "e.g. 28000"],
          ["location", "Property location", "e.g. Bengaluru, Karnataka"],
        ].map(([key, label, placeholder]) => (
          <View style={styles.field} key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              value={form[key]}
              onChangeText={update(key)}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
        ))}
        <View style={styles.field}>
          <Text style={styles.label}>Property notes</Text>
          <TextInput
            value={form.details}
            onChangeText={update("details")}
            placeholder="Amenities, access instructions, and availability"
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.input, styles.area]}
          />
        </View>
        <CommonButton title="Save listing" onPress={save} />
      </ScrollView>
    </View>
  );
}
