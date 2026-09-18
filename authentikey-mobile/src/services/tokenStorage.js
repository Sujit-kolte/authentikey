import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "authentikey.jwt";
const USER_KEY = "authentikey.user";

export async function saveSession(token, user) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getSession() {
  const [token, userValue] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  return { token, user: userValue ? JSON.parse(userValue) : null };
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
