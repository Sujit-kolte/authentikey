import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Camera, ImagePlus, MapPin, Video, X } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import CommonButton from "../../components/CommonButton";
import { colors } from "../../theme/colors";
import { supabase } from "../../services/supabase";
import {
  uploadPropertyDocument,
  uploadPropertyMedia,
} from "../../services/propertyService";
import styles from "./AddPropertyScreen.styles";

const transactions = [
  ["RENT", "Rent"],
  ["SALE", "Sale"],
];
const categories = [
  ["FLAT", "Flat"],
  ["HOUSE", "House"],
  ["PLOT", "Plot"],
];
const zones = [
  ["Residential NA", "Residential NA"],
  ["Commercial NA", "Commercial NA"],
  ["Agricultural", "Agricultural"],
];
const documents = [
  ["7_12_SADBARA", "7/12 (Satbara)"],
  ["LIGHT_BILL", "Electricity / Light Bill"],
  ["TAX_RECEIPT", "Property Tax Receipt"],
  ["INDEX_II", "Index II Deed"],
];
const MAX_ACCURACY_METRES = 35;

export default function AddPropertyScreen({ navigation }) {
  const { user, token } = useAuth();
  const cameraRef = useRef(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [form, setForm] = useState({
    transactionType: "RENT",
    category: "FLAT",
    title: "",
    description: "",
    price: "",
    tokenAmount: "",
    carpetAreaSqft: "",
    surveyNumber: "",
    zone: "Residential NA",
    documentType: "7_12_SADBARA",
    addressText: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerIdNumber: "",
    otherListings: "",
  });
  const [location, setLocation] = useState(null);
  const [boundaries, setBoundaries] = useState([]);
  const [document, setDocument] = useState(null);
  const [media, setMedia] = useState([]);
  const [proofVideo, setProofVideo] = useState(null);
  const [recording, setRecording] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState([]);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const update = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const isPlot = form.category === "PLOT";

  const distanceMetres = (first, second) => {
    const earthRadius = 6371000;
    const latDelta = ((second.latitude - first.latitude) * Math.PI) / 180;
    const lngDelta = ((second.longitude - first.longitude) * Math.PI) / 180;
    const a =
      Math.sin(latDelta / 2) ** 2 +
      Math.cos((first.latitude * Math.PI) / 180) *
        Math.cos((second.latitude * Math.PI) / 180) *
        Math.sin(lngDelta / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const addressDistance = async (point) => {
    const matches = await Location.geocodeAsync(form.addressText.trim());
    const addressPoint = matches?.[0];
    if (!addressPoint?.latitude || !addressPoint?.longitude) return null;
    return distanceMetres(point, addressPoint);
  };

  const selectImage = async (source) => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      setError(
        "Camera or photo library permission is required to attach a document.",
      );
      return;
    }
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.85,
          });
    if (!result.canceled && result.assets?.[0]) setDocument(result.assets[0]);
  };

  const selectMedia = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "video" ? ["videos"] : ["images"],
      allowsMultipleSelection: false,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      setMedia((current) => [...current, { ...result.assets[0], type }]);
    }
  };

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
          setProofVideo({
            uri: result.uri,
            type: "video",
            mimeType: "video/mp4",
          });
      })
      .catch((recordingError) => {
        if (active)
          setError(recordingError.message || "Unable to record video.");
      })
      .finally(() => {
        if (active) setRecording(false);
      });
    return () => {
      active = false;
    };
  }, [cameraPermission?.granted, recording]);

  const stopRecording = () => cameraRef.current?.stopRecording();

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      setError("Location permission is required for verification.");
      return;
    }
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    if (
      current.coords.accuracy &&
      current.coords.accuracy > MAX_ACCURACY_METRES
    ) {
      setError(
        `GPS accuracy is ${Math.round(current.coords.accuracy)}m. Move outdoors and try again.`,
      );
      return;
    }
    const point = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
    if (isPlot)
      setBoundaries((currentPoints) =>
        currentPoints.length < 4 ? [...currentPoints, point] : currentPoints,
      );
    else setLocation(point);
    let addressError = "";
    if (!isPlot && form.addressText.trim()) {
      const distance = await addressDistance(point);
      if (distance !== null && distance > 1000)
        addressError = `GPS is ${Math.round(distance)}m from the address. Capture the property location near the entered address.`;
    }
    setError(addressError);
  };

  const validate = () => {
    if (!user?.id) return "Your session has expired. Sign in again.";
    if (
      !form.ownerName.trim() ||
      !form.ownerPhone.trim() ||
      !form.ownerIdNumber.trim()
    )
      return "Owner name, phone number, and government ID number are required.";
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.addressText.trim()
    )
      return "Title, description, and address are required.";
    if (
      !Number(form.price) ||
      !Number(form.tokenAmount) ||
      !Number(form.carpetAreaSqft)
    )
      return "Enter valid price, token amount, and carpet area.";
    if (Number(form.tokenAmount) > Number(form.price))
      return "Token amount cannot exceed the asking price.";
    if (!document) return "Attach an ownership document image.";
    if (!proofVideo) return "Record a live physical verification video.";
    if (
      isPlot &&
      (!form.surveyNumber.trim() || !form.zone || boundaries.length !== 4)
    )
      return "Plots require a survey number, land zone, and four GPS corners.";
    if (!isPlot && !location)
      return "Capture the property's current GPS location.";
    return "";
  };

  const publish = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    try {
      setVerificationComplete(false);
      setVerificationSteps([
        {
          key: "price",
          label: "Checking price and token amount",
          state: "active",
        },
        {
          key: "address",
          label: "Checking address and GPS location",
          state: "pending",
        },
        {
          key: "documents",
          label: "Checking ownership documents",
          state: "pending",
        },
        { key: "owner", label: "Checking owner details", state: "pending" },
        {
          key: "media",
          label: "Checking property photos and videos",
          state: "pending",
        },
        {
          key: "externalListings",
          label: "Checking other listing websites",
          state: "pending",
        },
      ]);
      setStatus("Uploading verification evidence...");
      const documentUrl = await uploadPropertyDocument(document, user.id);
      const proofVideoUrl = await uploadPropertyMedia(proofVideo, user.id);
      const mediaUrls = await Promise.all(
        media.map(async (asset) => ({
          type: asset.type,
          url: await uploadPropertyMedia(asset, user.id),
        })),
      );
      const point = isPlot ? boundaries[0] : location;
      const addressDistanceMetres = await addressDistance(point);
      setStatus("Saving listing for verification...");
      const { data: property, error: insertError } = await supabase
        .from("properties")
        .insert({
          seller_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          token_amount: Number(form.tokenAmount),
          carpet_area_sqft: Number(form.carpetAreaSqft),
          transaction_type: form.transactionType,
          category: form.category,
          survey_number: isPlot ? form.surveyNumber.trim() : null,
          zone: isPlot ? form.zone : null,
          address_text: form.addressText.trim(),
          location: `POINT(${point.longitude} ${point.latitude})`,
          boundary_polygon: isPlot
            ? `POLYGON((${boundaries
                .concat([boundaries[0]])
                .map(({ longitude, latitude }) => `${longitude} ${latitude}`)
                .join(",")}))`
            : null,
          document_url: documentUrl,
          document_type: form.documentType,
          is_verified: false,
          composite_risk_score: 0,
          owner_name: form.ownerName.trim(),
          owner_phone: form.ownerPhone.trim(),
          owner_email: form.ownerEmail.trim() || null,
          owner_id_number: form.ownerIdNumber.trim(),
          external_listing_urls: form.otherListings
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean),
          property_media: mediaUrls,
          physical_proof_video_url: proofVideoUrl,
          proof_latitude: point.latitude,
          proof_longitude: point.longitude,
          proof_address_distance_metres: addressDistanceMetres,
          verification_status: "VERIFYING",
        })
        .select()
        .single();
      if (insertError) throw insertError;
      let backendVerification = null;
      if (token) {
        try {
          const response = await api.post(
            `/api/v1/properties/${property.id}/verify`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
          backendVerification = response.data;
        } catch (verificationError) {
          setStatus(
            `Backend verification unavailable: ${verificationError.message}`,
          );
        }
      }
      const checks = [
        [
          "price",
          Number(form.price) > 0 &&
            Number(form.tokenAmount) <= Number(form.price),
        ],
        [
          "address",
          addressDistanceMetres === null || addressDistanceMetres <= 1000,
        ],
        ["documents", Boolean(documentUrl)],
        [
          "owner",
          Boolean(
            form.ownerName.trim() &&
            form.ownerPhone.trim() &&
            form.ownerIdNumber.trim(),
          ),
        ],
        ["media", mediaUrls.length > 0],
        [
          "externalListings",
          form.otherListings
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
            .every((url) => /^https?:\/\//i.test(url)),
        ],
      ];
      for (let index = 0; index < checks.length; index += 1) {
        const [key, passed] = checks[index];
        setVerificationSteps((current) =>
          current.map((step, stepIndex) =>
            stepIndex === index
              ? { ...step, state: passed ? "complete" : "error" }
              : step,
          ),
        );
        if (!passed)
          throw new Error(
            `Verification could not confirm ${key}. Review the entered details and evidence.`,
          );
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (index < checks.length - 1)
          setVerificationSteps((current) =>
            current.map((step, stepIndex) =>
              stepIndex === index + 1 ? { ...step, state: "active" } : step,
            ),
          );
      }
      if (backendVerification && backendVerification.status !== "VERIFIED") {
        setVerificationSteps((current) =>
          current.map((step) =>
            backendVerification.checks?.[step.key] === false
              ? { ...step, state: "error" }
              : step,
          ),
        );
        throw new Error(
          backendVerification.issues?.join(" ") ||
            "Backend verification found issues with this listing.",
        );
      }
      const localChecks = Object.fromEntries(
        checks.map(([key, passed]) => [key, passed]),
      );
      await supabase
        .from("properties")
        .update({
          is_verified: backendVerification
            ? backendVerification.status === "VERIFIED"
            : true,
          verification_status: backendVerification?.status || "VERIFIED",
          verification_checks: backendVerification?.checks || localChecks,
          verification_issues: backendVerification?.issues || [],
        })
        .eq("id", property.id);
      setVerificationComplete(true);
      setStatus("");
    } catch (submitError) {
      setStatus("");
      setError(submitError.message || "Unable to save the listing.");
    }
  };

  const selector = (items, key) => (
    <View style={styles.selectorWrap}>
      {items.map(([value, label]) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.selector,
            form[key] === value && styles.selectorActive,
          ]}
          onPress={() => update(key)(value)}>
          <Text
            style={[
              styles.selectorText,
              form[key] === value && styles.selectorTextActive,
            ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  const field = (key, label, placeholder, multiline = false) => (
    <View style={styles.field} key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={form[key]}
        onChangeText={update(key)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.multiline]}
        multiline={multiline}
        keyboardType={
          ["price", "tokenAmount", "carpetAreaSqft"].includes(key)
            ? "numeric"
            : "default"
        }
      />
    </View>
  );

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back to listings</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add property</Text>
        <Text style={styles.subtitle}>
          Save a real listing with location and ownership proof.
        </Text>
        <Text style={styles.sectionTitle}>Transaction type</Text>
        {selector(transactions, "transactionType")}
        <Text style={styles.sectionTitle}>Category</Text>
        {selector(categories, "category")}
        <Text style={styles.sectionTitle}>Property details</Text>
        {field("title", "Title", "e.g. 2BHK with garden")}
        {field("description", "Description", "Describe the property", true)}
        {field(
          "price",
          form.transactionType === "RENT"
            ? "Monthly rent (₹)"
            : "Asking price (₹)",
          "e.g. 28000",
        )}
        {field("tokenAmount", "Advance / token amount (₹)", "e.g. 56000")}
        {field("carpetAreaSqft", "Carpet area (sq.ft)", "e.g. 1050")}
        {field("addressText", "Full address", "Street, locality, city")}
        <Text style={styles.sectionTitle}>Owner details</Text>
        {field(
          "ownerName",
          "Legal owner name",
          "Name exactly as shown on ownership proof",
        )}
        {field("ownerPhone", "Owner phone number", "+91 9876543210")}
        {field("ownerEmail", "Owner email (optional)", "owner@example.com")}
        {field(
          "ownerIdNumber",
          "Government ID / title reference",
          "Required for ownership verification",
        )}
        {field(
          "otherListings",
          "Other websites where listed (optional)",
          "Paste URLs separated by commas",
        )}
        {isPlot && (
          <>
            <Text style={styles.sectionTitle}>Plot details</Text>
            {field("surveyNumber", "Survey / Gat number", "e.g. 142/2A")}
            {selector(zones, "zone")}
          </>
        )}
        <Text style={styles.sectionTitle}>Live GPS capture</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={captureLocation}>
          <MapPin size={18} color={colors.primary} />
          <Text style={styles.locationText}>
            {isPlot
              ? `Record corner ${Math.min(boundaries.length + 1, 4)} of 4`
              : "Capture property location"}
          </Text>
        </TouchableOpacity>
        {!isPlot && location && (
          <Text style={styles.locationBadge}>
            GPS captured: {location.latitude.toFixed(5)},{" "}
            {location.longitude.toFixed(5)}
          </Text>
        )}
        {isPlot &&
          boundaries.map((point, index) => (
            <Text
              key={`${point.latitude}-${point.longitude}`}
              style={styles.boundaryText}>
              Corner {index + 1}: {point.latitude.toFixed(5)},{" "}
              {point.longitude.toFixed(5)}
            </Text>
          ))}
        <Text style={styles.sectionTitle}>Physical presence proof</Text>
        {cameraPermission?.granted && recording ? (
          <View style={styles.cameraPreview}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              mode="video"
            />
            <CommonButton title="Stop recording" onPress={stopRecording} />
          </View>
        ) : proofVideo ? (
          <View style={styles.proofReady}>
            <Text style={styles.locationText}>
              Live verification video recorded and ready to upload.
            </Text>
            <CommonButton
              title="Record again"
              variant="secondary"
              onPress={() => setProofVideo(null)}
            />
          </View>
        ) : (
          <CommonButton
            title="Start live verification video"
            onPress={startRecording}
            icon={Video}
          />
        )}
        <Text style={styles.sectionTitle}>Document proof</Text>
        {selector(documents, "documentType")}
        <View style={styles.uploadRow}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectImage("camera")}>
            <Camera size={19} color={colors.primary} />
            <Text style={styles.uploadText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectImage("gallery")}>
            <ImagePlus size={19} color={colors.primary} />
            <Text style={styles.uploadText}>Gallery</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Property photos and videos</Text>
        <View style={styles.uploadRow}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectMedia("image")}>
            <ImagePlus size={19} color={colors.primary} />
            <Text style={styles.uploadText}>Add photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectMedia("video")}>
            <Video size={19} color={colors.primary} />
            <Text style={styles.uploadText}>Add video</Text>
          </TouchableOpacity>
        </View>
        {media.map((asset, index) => (
          <View style={styles.mediaRow} key={`${asset.uri}-${index}`}>
            <Text style={styles.locationText}>
              {asset.type === "video" ? "Video" : "Photo"} {index + 1} attached
            </Text>
            <TouchableOpacity
              onPress={() =>
                setMedia((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index),
                )
              }>
              <X size={17} color={colors.warning} />
            </TouchableOpacity>
          </View>
        ))}
        {document && (
          <View style={styles.previewWrap}>
            <Image source={{ uri: document.uri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.remove}
              onPress={() => setDocument(null)}>
              <X size={17} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.previewCaption}>
              Document attached. Tap X to remove or retake.
            </Text>
          </View>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        {verificationSteps.length > 0 ? (
          <View style={styles.verificationPanel}>
            <Text style={styles.sectionTitle}>Verification progress</Text>
            {verificationSteps.map((step) => (
              <View style={styles.verificationRow} key={step.key}>
                <Text style={styles.verificationIcon}>
                  {step.state === "complete"
                    ? "✓"
                    : step.state === "error"
                      ? "!"
                      : step.state === "active"
                        ? "..."
                        : "○"}
                </Text>
                <Text style={styles.statusText}>{step.label}</Text>
              </View>
            ))}
            {verificationComplete && (
              <Text style={styles.success}>
                Property listed successfully and verified.
              </Text>
            )}
          </View>
        ) : status ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : (
          <CommonButton title="Save verified listing" onPress={publish} />
        )}
      </ScrollView>
    </View>
  );
}
