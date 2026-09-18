import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CheckCircle2, Plus } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { colors } from "../../theme/colors";
import styles from "./SellerMyListingsScreen.styles";

const documentLabel = {
  "7_12_SADBARA": "7/12 Satbara",
  LIGHT_BILL: "Light Bill",
  TAX_RECEIPT: "Tax Receipt",
  INDEX_II: "Index II",
};

export default function SellerMyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const loadListings = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    const { data, error: queryError } = await supabase
      .from("properties")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else {
      setListings(data || []);
      setError("");
    }
    setRefreshing(false);
  }, [user?.id]);
  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings]),
  );
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("SellerPropertyDetailScreen", { property: item })
      }>
      <Image source={{ uri: item.document_url }} style={styles.thumbnail} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <Text style={styles.location}>{item.address_text}</Text>
        <Text style={styles.price}>
          ₹{Number(item.price).toLocaleString("en-IN")}{" "}
          <Text style={styles.priceUnit}>
            {item.transaction_type === "RENT" ? "/ month" : "sale price"}
          </Text>
        </Text>
        <View style={styles.badgeRow}>
          <Text style={styles.documentBadge}>
            {documentLabel[item.document_type] || item.document_type}
          </Text>
          <View
            style={[
              styles.status,
              item.is_verified ? styles.statusVerified : styles.statusPending,
            ]}>
            <CheckCircle2
              size={14}
              color={item.is_verified ? colors.safe : colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.is_verified ? colors.safe : colors.warning },
              ]}>
              {item.is_verified ? "Verified" : "Verification pending"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safe}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadListings}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>LANDLORD WORKSPACE</Text>
            <Text style={styles.title}>My properties</Text>
            <Text style={styles.subtitle}>
              Listings stored securely in Supabase.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !refreshing ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No properties yet. Add your first listing.
              </Text>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPropertyScreen")}>
        <Plus size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}
