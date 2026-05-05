// Global auth state to share between AuthContext and apiClient
// This ensures apiClient always uses the database role, not stale Firebase claims

let currentAuthState = {
  userId: null,
  databaseRole: null, // Source of truth - from database
  firebaseToken: null,
};

// Listeners for auth state changes
const listeners = [];

export const setAuthState = (state) => {
  currentAuthState = { ...currentAuthState, ...state };
  // Notify all listeners of the change
  listeners.forEach((listener) => listener(currentAuthState));
};

export const getAuthState = () => currentAuthState;

export const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners.splice(listeners.indexOf(listener), 1);
  };
};

export const updateDatabaseRole = (role) => {
  setAuthState({ databaseRole: role });
};

export const updateUserId = (userId) => {
  setAuthState({ userId });
};

export const updateFirebaseToken = (token) => {
  setAuthState({ firebaseToken: token });
};

export const clearAuthState = () => {
  currentAuthState = {
    userId: null,
    databaseRole: null,
    firebaseToken: null,
  };
};
