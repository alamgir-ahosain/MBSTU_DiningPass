import axios from "axios";
import { auth } from "../firebase";
import { getAuthState } from "./authState";

const API = import.meta.env.VITE_API_BASE_URL ;

// Helper to decode JWT and extract custom claims
const getCustomClaimsFromToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { role: null };

    const decoded = JSON.parse(atob(parts[1]));
    return {
      role: decoded.role || null,
      dbId: decoded.dbId || null,
    };
  } catch (err) {
    console.error("Error decoding token:", err);
    return { role: null };
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000,
});

// Add interceptor to attach Firebase ID token and user role
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // Force refresh to get latest claims
      // Get the database role from global auth state (source of truth)
      const authState = getAuthState();
      const databaseRole = authState.databaseRole;

      // Fallback to claims role if database role not yet loaded
      const claims = getCustomClaimsFromToken(token);
      const roleToUse = databaseRole || claims.role || "STUDENT";

      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-User-Id"] = user.uid;
      config.headers["X-User-Role"] = roleToUse;

      console.log("API Request Headers:", {
        "X-User-Id": user.uid,
        "X-User-Role": roleToUse,
        "Role Source": databaseRole ? "database" : "firebase-claims",
      });
    }
  } catch (error) {
    console.error("Error getting ID token:", error);
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
