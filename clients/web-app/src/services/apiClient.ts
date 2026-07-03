import axios, { InternalAxiosRequestConfig } from "axios";
import { auth } from "../firebase";
import { getAuthState } from "./authState";

const API = import.meta.env.VITE_API_BASE_URL as string;

interface TokenClaims {
  role: string | null;
  dbId: string | null;
}

const getCustomClaimsFromToken = (token: string): TokenClaims => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { role: null, dbId: null };
    const decoded = JSON.parse(atob(parts[1]));
    return {
      role: decoded.role ?? null,
      dbId: decoded.dbId ?? null,
    };
  } catch {
    return { role: null, dbId: null };
  }
};

const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      const authState    = getAuthState();
      const databaseRole = authState.databaseRole;
      const claims       = getCustomClaimsFromToken(token);
      const roleToUse    = databaseRole ?? claims.role ?? "STUDENT";

      config.headers.Authorization  = `Bearer ${token}`;
      config.headers["X-User-Id"]   = user.uid;
      config.headers["X-User-Role"] = roleToUse;
    }
  } catch (error) {
    console.error("Error getting ID token:", error);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;