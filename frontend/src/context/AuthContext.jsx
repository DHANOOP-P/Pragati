import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pragati_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("pragati_token");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(payload) {
        const { data } = await api.post("/auth/login", payload);
        localStorage.setItem("pragati_token", data.token);
        setUser(data.user);
        return data.user;
      },
      async signup(payload) {
        const { data } = await api.post("/auth/signup", payload);
        localStorage.setItem("pragati_token", data.token);
        setUser(data.user);
        return data.user;
      },
      async forgotPassword(email) {
        const { data } = await api.post("/auth/forgot-password", { email });
        return data;
      },
      async updateProfile(payload) {
        const { data } = await api.patch("/auth/me", payload);
        setUser(data.user);
        return data;
      },
      logout() {
        localStorage.removeItem("pragati_token");
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
