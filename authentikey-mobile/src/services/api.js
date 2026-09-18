import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL || "https://api.authentikey.example.com",
  timeout: 12000,
});

export async function analyzeListing(payload) {
  try {
    const response = await api.post("/listings/analyze", payload);
    return response.data;
  } catch (error) {
    return null;
  }
}

export default api;
