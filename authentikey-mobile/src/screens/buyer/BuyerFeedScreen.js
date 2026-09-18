import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PropertyCard from "../../components/PropertyCard";
import { supabase } from "../../services/supabase";
import { colors } from "../../theme/colors";
import styles from "./BuyerFeedScreen.styles";

const filters = [
  ["ALL", "All"],
  ["FLAT", "Flats"],
  ["HOUSE", "Houses"],
  ["PLOT", "Plots"],
];

function normalize(property) {
  const [locality = "", city = ""] = (property.address_text || "")
    .split(",")
    .map((part) => part.trim());
  return {
    ...property,
    transactionType: property.transaction_type,
    tokenAmount: property.token_amount,
    carpetAreaSqFt: property.carpet_area_sqft,
    locality,
    city,
    thumbnailUri: property.document_url,
    riskScore: property.composite_risk_score ?? 0,
    coordinates: {
      latitude: Number(property.latitude || 0),
      longitude: Number(property.longitude || 0),
    },
    seller: {
      name: property.owner_name,
      phone: property.owner_phone,
      isVerified: property.is_verified,
    },
  };
}

export default function BuyerFeedScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const loadProperties = useCallback(async () => {
    setRefreshing(true);
    const { data, error: queryError } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else {
      setProperties((data || []).map(normalize));
      setError("");
    }
    setRefreshing(false);
  }, []);
  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties]),
  );
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return properties.filter(
      (property) =>
        (filter === "ALL" || property.category === filter) &&
        (!search ||
          [
            property.title,
            property.locality,
            property.city,
            property.address_text,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(search),
          )),
    );
  }, [filter, properties, query]);
  return (
    <View style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadProperties}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>VERIFIED MARKETPLACE</Text>
            <Text style={styles.title}>Find a safer home</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search title, city, or locality"
              placeholderTextColor={colors.muted}
              style={styles.search}
            />
            <FlatList
              data={filters}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={([value]) => value}
              contentContainerStyle={styles.chips}
              renderItem={({ item: [value, label] }) => (
                <TouchableOpacity
                  style={[styles.chip, filter === value && styles.chipActive]}
                  onPress={() => setFilter(value)}>
                  <Text
                    style={[
                      styles.chipText,
                      filter === value && styles.chipTextActive,
                    ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.result}>
              {filtered.length} properties available
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() =>
              navigation.navigate("BuyerPropertyDetailScreen", {
                property: item,
              })
            }
          />
        )}
        ListEmptyComponent={
          !refreshing ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No listings match your search.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
