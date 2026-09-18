import React, { createContext, useContext, useMemo, useState } from "react";

const PropertyContext = createContext(null);
const sampleThumbnail =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

const initialProperties = [
  {
    id: "property-bellandur-rent",
    transactionType: "RENT",
    category: "FLAT",
    title: "Bright 2BHK flat near Bellandur Lake",
    price: 28000,
    tokenAmount: 56000,
    carpetAreaSqFt: 1050,
    surveyNumber: "",
    zone: "",
    locality: "Bellandur",
    city: "Bangalore",
    coordinates: { latitude: 12.9304, longitude: 77.6784 },
    plotBoundaries: [],
    thumbnailUri: sampleThumbnail,
    videoDuration: "01:24",
    seller: {
      name: "Sujit K.",
      phone: "+91 9876543210",
      isVerified: true,
      role: "OWNER",
    },
    documentType: "TAX_RECEIPT",
    riskScore: 12,
    bhk: "2 BHK",
    furnishing: "Semi-furnished",
  },
  {
    id: "property-baner-sale",
    transactionType: "SALE",
    category: "HOUSE",
    title: "3BHK independent villa with private garden",
    price: 18500000,
    tokenAmount: 925000,
    carpetAreaSqFt: 2200,
    surveyNumber: "",
    zone: "",
    locality: "Baner",
    city: "Pune",
    coordinates: { latitude: 18.559, longitude: 73.7796 },
    plotBoundaries: [],
    thumbnailUri:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
    videoDuration: "02:08",
    seller: {
      name: "Sujit K.",
      phone: "+91 9876543210",
      isVerified: true,
      role: "OWNER",
    },
    documentType: "INDEX_II",
    riskScore: 15,
    bhk: "3 BHK",
    furnishing: "Unfurnished",
  },
  {
    id: "property-hinjawadi-plot",
    transactionType: "SALE",
    category: "PLOT",
    title: "2400 sq.ft Residential NA plot",
    price: 7200000,
    tokenAmount: 360000,
    carpetAreaSqFt: 2400,
    surveyNumber: "142/2A",
    zone: "Residential",
    locality: "Hinjawadi Phase 3",
    city: "Pune",
    coordinates: { latitude: 18.5912, longitude: 73.7389 },
    plotBoundaries: [
      { latitude: 18.5912, longitude: 73.7389 },
      { latitude: 18.59145, longitude: 73.7392 },
      { latitude: 18.59118, longitude: 73.73955 },
      { latitude: 18.5909, longitude: 73.73918 },
    ],
    thumbnailUri:
      "https://images.unsplash.com/photo-1500382017468-9049fedeffff?w=1200",
    videoDuration: "01:47",
    seller: {
      name: "Sujit K.",
      phone: "+91 9876543210",
      isVerified: true,
      role: "OWNER",
    },
    documentType: "7_12_EXTRACT",
    riskScore: 9,
  },
];

export function PropertyProvider({ children }) {
  const [properties, setProperties] = useState(initialProperties);
  const addProperty = (property) => {
    const nextProperty = {
      ...property,
      id: property.id || `property-${Date.now()}`,
      plotBoundaries: property.plotBoundaries || [],
      riskScore: property.riskScore ?? 14,
    };
    setProperties((current) => [nextProperty, ...current]);
    return nextProperty;
  };
  const deleteProperty = (propertyId) =>
    setProperties((current) => current.filter(({ id }) => id !== propertyId));
  const value = useMemo(
    () => ({
      properties,
      addProperty,
      deleteProperty,
      sellerProperties: properties,
    }),
    [properties],
  );
  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (!context)
    throw new Error("useProperties must be used inside PropertyProvider");
  return context;
}
