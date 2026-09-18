import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

function makeUser(profile, authUser) {
  return {
    id: authUser.id,
    name:
      profile?.full_name ||
      authUser.user_metadata?.full_name ||
      "AuthentiKey user",
    email: profile?.email || authUser.email || "",
    phone: profile?.phone || authUser.user_metadata?.phone || "",
    role: (
      profile?.role ||
      authUser.user_metadata?.role ||
      "BUYER"
    ).toLowerCase(),
    aadhaarVerified: Boolean(profile?.aadhaar_verified),
  };
}

async function getProfile(authUser) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (error) throw error;
  return makeUser(data, authUser);
}

async function ensureProfile(authUser) {
  const metadata = authUser.user_metadata || {};
  const role = metadata.role === "SELLER" ? "SELLER" : "BUYER";
  const phone = authUser.phone || metadata.phone || "";
  const { error } = await supabase.from("users").upsert({
    id: authUser.id,
    full_name: metadata.full_name || authUser.email || "AuthentiKey user",
    email: (
      authUser.email || `${phone.replace(/\D/g, "")}@phone.authentikey.local`
    ).toLowerCase(),
    phone,
    password_hash: "managed-by-supabase-auth",
    role,
  });
  if (error) throw error;
  return getProfile(authUser);
}

async function loadUser(authUser) {
  try {
    return await ensureProfile(authUser);
  } catch (error) {
    console.warn("AuthentiKey profile sync failed", error.message);
    return makeUser(null, authUser);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (!active) return;
        setSession(data.session);
        setUser(data.session ? await loadUser(data.session.user) : null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        setUser(nextSession ? await loadUser(nextSession.user) : null);
        setIsLoading(false);
      },
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const requestOtp = async (phone, metadata, shouldCreateUser = false) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { data: metadata, shouldCreateUser },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
    return { phone };
  };

  const verifyOtp = async (phone, token, credentials = {}) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    if (credentials.email && credentials.password) {
      const { error: credentialError } = await supabase.auth.updateUser({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        data: {
          full_name: credentials.name,
          phone,
          role: credentials.role === "seller" ? "SELLER" : "BUYER",
        },
      });
      if (credentialError) {
        setIsLoading(false);
        throw credentialError;
      }
    }
    setSession(data.session);
    setUser(await loadUser(data.user));
    setIsLoading(false);
    return data.user;
  };

  const login = async (email, password) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    setSession(data.session);
    setUser(await loadUser(data.user));
    setIsLoading(false);
  };

  const signup = async (formData) => {
    setIsLoading(true);
    const role = formData.role === "seller" ? "SELLER" : "BUYER";
    return requestOtp(
      formData.phone,
      {
        full_name: formData.name,
        phone: formData.phone,
        role,
      },
      true,
    );
  };

  const value = useMemo(
    () => ({
      user,
      token: session?.access_token || null,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      login,
      requestOtp,
      verifyOtp,
      signup,
      logout: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      },
    }),
    [isLoading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
