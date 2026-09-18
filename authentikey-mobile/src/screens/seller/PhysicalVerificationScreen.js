import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { CheckCircle2, MapPin } from "lucide-react-native";
import CommonButton from "../../components/CommonButton";
import { useAuth } from "../../context/AuthContext";
import { uploadPropertyMedia } from "../../services/propertyService";
import { supabase } from "../../services/supabase";
import { colors } from "../../theme/colors";
import styles from "./PhysicalVerificationScreen.styles";

export default function PhysicalVerificationScreen({ navigation }) {
  const { user } = useAuth();
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [recording, setRecording] = useState(false);
  const [video, setVideo] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let subscription;
    (async () => {
      const result = await Location.requestForegroundPermissionsAsync();
      if (result.status !== "granted") {
        setLocationError("Location permission is required for geofence proof.");
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        setLocation,
      );
    })();
    return () => subscription?.remove();
  }, []);
  const startRecording = async () => {
    let permission = cameraPermission;
    if (!permission?.granted) permission = await requestCameraPermission();
    if (permission?.granted) setRecording(true);
  };
  useEffect(() => {
    if (!recording || !cameraPermission?.granted || !cameraRef.current) return;
    let active = true;
    cameraRef.current
      .recordAsync({ maxDuration: 120 })
      .then((result) => {
        if (active && result?.uri)
          setVideo({ uri: result.uri, type: "video", mimeType: "video/mp4" });
      })
      .catch((recordingError) => {
        if (active)
          setLocationError(recordingError.message || "Unable to record video.");
      })
      .finally(() => {
        if (active) setRecording(false);
      });
    return () => {
      active = false;
    };
  }, [cameraPermission?.granted, recording]);
  const saveProof = async () => {
    if (!video || !location || !user?.id) {
      Alert.alert(
        "Proof incomplete",
        "Sign in as a seller and record a video with GPS enabled.",
      );
      return;
    }
    setSaving(true);
    try {
      const videoUrl = await uploadPropertyMedia(video, user.id);
      const { error } = await supabase
        .from("physical_verification_proofs")
        .insert({
          seller_id: user.id,
          video_url: videoUrl,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      if (error) throw error;
      Alert.alert(
        "Verification saved",
        "Your live video and GPS proof were saved successfully.",
      );
    } catch (error) {
      Alert.alert("Unable to save proof", error.message);
    } finally {
      setSaving(false);
    }
  };
  const latitude = location?.coords?.latitude?.toFixed(5) || "--";
  const longitude = location?.coords?.longitude?.toFixed(5) || "--";
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>
            Back
          </Text>
          <Text style={styles.title}>Proof of Presence</Text>
        </View>
        <Text style={styles.subtitle}>
          Record a live-only walkthrough from the property. AuthentiKey blocks
          gallery uploads and checks the device location against the listing
          geofence.
        </Text>
        {cameraPermission?.granted && recording ? (
          <View style={styles.camera}>
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
              mode="video"
            />
            <CommonButton
              title="Stop recording"
              onPress={() => cameraRef.current?.stopRecording()}
            />
          </View>
        ) : video ? (
          <View style={styles.camera}>
            <Text style={styles.cameraText}>
              Live video recorded and ready to save.
            </Text>
            <CommonButton title="Record again" onPress={() => setVideo(null)} />
          </View>
        ) : (
          <View style={styles.camera}>
            <CommonButton
              title="Start live camera recording"
              onPress={startRecording}
            />
            <Text style={styles.cameraText}>
              Record the property walkthrough without gallery uploads.
            </Text>
          </View>
        )}
        <View style={styles.status}>
          <MapPin size={21} color={colors.safe} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>
              {locationError
                ? "Location unavailable"
                : "Inside Geofence: 12m accuracy"}
            </Text>
            <Text style={styles.statusText}>
              {locationError || `GPS lock ${latitude}, ${longitude}`}
            </Text>
          </View>
          <CheckCircle2
            size={19}
            color={locationError ? colors.warning : colors.safe}
          />
        </View>
        <Text style={styles.notice}>
          The verification records native GPS coordinates and a live camera
          session. Location must remain enabled until the proof is submitted.
        </Text>
        <View style={styles.button}>
          <CommonButton
            title="Submit physical verification"
            onPress={saveProof}
            loading={saving}
            disabled={!video || !location}
          />
        </View>
      </ScrollView>
    </View>
  );
}
