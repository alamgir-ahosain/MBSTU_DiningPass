import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import axios from 'axios';
import { setAuthState, updateDatabaseRole, updateUserId, clearAuthState } from '../services/authState';

const AuthContext = createContext();

// Helper function to decode JWT and extract custom claims
const getCustomClaimsFromToken = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const decoded = JSON.parse(atob(parts[1]));
        return {
            role: decoded.role || null,
            dbId: decoded.dbId || null,
        };
    } catch (err) {
        console.error('Error decoding token:', err);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API = import.meta.env.VITE_API_BASE_URL;

    // Helper to get ID token
    const getIdToken = async () => {
        if (user) {
            return await user.getIdToken();
        }
        return null;
    };

    // Fetch user role and data from backend
    const fetchUserData = async (firebaseUser, forceRefresh = true) => {
        try {
            // Force refresh token to get latest custom claims from Firebase
            const token = await firebaseUser.getIdToken(forceRefresh);

            // Update global auth state with user ID and token
            updateUserId(firebaseUser.uid);

            // Extract role from custom claims in JWT (fallback only)
            const claims = getCustomClaimsFromToken(token);
            const claimsRole = claims?.role;

            console.log('Custom claims:', claims);
            console.log('User role from claims:', claimsRole);

            // Try to fetch from database first (database is the source of truth)
            try {
                // Always try /api/v1/students/me first
                const response = await axios.get(`${API}/api/v1/students/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-User-Id': firebaseUser.uid,
                        // Use claims role as fallback if available
                        'X-User-Role': claimsRole || 'STUDENT',
                    },
                });

                if (response.data) {
                    console.log('Database response:', response.data);
                    setUserData(response.data);

                    // PRIORITY: Use role from database response as source of truth
                    const databaseRole = response.data.role;
                    if (databaseRole) {
                        console.log('Using database role:', databaseRole);
                        setRole(databaseRole);
                        // Update global auth state so apiClient can use the database role
                        updateDatabaseRole(databaseRole);
                    } else if (claimsRole) {
                        console.log('Database role not found, using claims role:', claimsRole);
                        setRole(claimsRole);
                    }
                }
            } catch (apiErr) {
                console.error('Error fetching from /students/me:', apiErr.response?.data);

                // If student endpoint fails, use claims role as fallback
                if (claimsRole) {
                    console.log('Student endpoint failed, using claims role:', claimsRole);
                    setRole(claimsRole);
                    updateDatabaseRole(claimsRole);
                }
                setUserData(null);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setUserData(null);
        }
    };

    // Refresh user data from backend (call after role update)
    const syncRoleWithDatabase = async () => {
        if (user) {
            console.log('Syncing role with database...');
            await fetchUserData(user, true); // Force refresh
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    await fetchUserData(firebaseUser, true); // Force refresh on login
                } else {
                    setUser(null);
                    setRole(null);
                    setUserData(null);
                    clearAuthState(); // Clear global auth state on logout
                }
            } catch (err) {
                setError(err.message);
                console.error('Auth error:', err);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // Refresh user data
    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user, true); // Force refresh token
        }
    };

    // Sign out
    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setRole(null);
            setUserData(null);
            clearAuthState(); // Clear global auth state on logout
        } catch (err) {
            setError(err.message);
            console.error('Logout error:', err);
        }
    };

    const value = {
        user,
        role,
        userData,
        loading,
        error,
        getIdToken,
        fetchUserData,
        refreshUserData,
        syncRoleWithDatabase, // Call this after role is updated
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
