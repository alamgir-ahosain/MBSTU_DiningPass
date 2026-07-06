import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
// import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, } from "firebase/auth";
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebase";
import {
    updateDatabaseRole,
    updateUserId,
    clearAuthState,
} from "../services/authState";
import { studentAPI } from "../services/api"; // adjust path to match your project
// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenClaims {
    role: string | null;
    dbId: string | null;
}

export interface UserData {
    role?: string;
    fullName?: string;
    hallShortName?: string;
    studentId?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    hallId?: string;
    [key: string]: unknown;
}

interface AuthContextType {
    user: User | null;
    role: string | null;
    userData: UserData | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: {
        email: string;
        password: string;
    }) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    getIdToken: () => Promise<string | null>;
    refreshUserData: () => Promise<void>;
    refreshProfile: () => Promise<void>; // add this
    syncRoleWithDatabase: () => Promise<void>;
    logout: () => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getCustomClaimsFromToken = (token: string): TokenClaims => {
    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            return {
                role: null,
                dbId: null,
            };
        }

        const decoded = JSON.parse(atob(parts[1]));

        return {
            role: decoded.role ?? null,
            dbId: decoded.dbId ?? null,
        };
    } catch {
        return {
            role: null,
            dbId: null,
        };
    }
};

export interface RegisterData {
    studentId: string;
    fullName: string;
    email: string;
    password: string;
    hallShortName: string;
    roomNumber?: string;
    department: string;
    gender: "MALE" | "FEMALE";
}
// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({
                                 children,
                             }: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API = import.meta.env.VITE_API_BASE_URL as string;

    const getIdToken = async (): Promise<string | null> => {
        if (!user) return null;
        return await user.getIdToken();
    };

    const fetchUserData = async (
        firebaseUser: User,
        forceRefresh = true
    ): Promise<void> => {
        try {
            const token = await firebaseUser.getIdToken(forceRefresh);

            updateUserId(firebaseUser.uid);

            const claims = getCustomClaimsFromToken(token);

            try {
                // Route to the correct profile endpoint based on role
                const isAdminRole = ["HALL_ADMIN", "HALL_STAFF", "SUPER_ADMIN"].includes(
                    claims.role ?? ""
                );
                const profileEndpoint = isAdminRole
                    ? `${API}/api/v1/admins/me`
                    : `${API}/api/v1/students/me`;

                const response = await axios.get<UserData>(
                    profileEndpoint,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "X-User-Id": firebaseUser.uid,
                            "X-User-Role": claims.role ?? "STUDENT",
                        },
                    }
                );

                if (response.data) {
                    setUserData(response.data);

                    const databaseRole = response.data.role;

                    if (databaseRole) {
                        setRole(databaseRole);
                        updateDatabaseRole(databaseRole);
                    } else if (claims.role) {
                        setRole(claims.role);
                        updateDatabaseRole(claims.role);
                    }
                }
            } catch (apiError) {
                console.error("Failed to fetch profile data:", apiError);

                if (claims.role) {
                    setRole(claims.role);
                    updateDatabaseRole(claims.role);
                }

                setUserData(null);
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setUserData(null);
        }
    };

    const syncRoleWithDatabase = async (): Promise<void> => {
        if (user) {
            await fetchUserData(user, true);
        }
    };

    useEffect(() => {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    await fetchUserData(firebaseUser, true);
                } else {
                    setUser(null);
                    setRole(null);
                    setUserData(null);
                    clearAuthState();
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Authentication error"
                );
            } finally {
                setLoading(false);
            }
        });
    }, []);

    const refreshUserData = async (): Promise<void> => {
        if (user) {
            await fetchUserData(user, true);
        }
    };
    const login = async ({
                             email,
                             password,
                         }: {
        email: string;
        password: string;
    }): Promise<void> => {
        try {
            setError(null);

            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            await fetchUserData(credential.user, true);
        } catch (err) {
            console.error(err);
            throw new Error(
                err instanceof Error ? err.message : "Invalid email or password",
                { cause: err }
            );
        }
    };


    const register = async (data: RegisterData): Promise<void> => {
        try {
            setError(null);

            // Backend creates Firebase user + DB record + sets custom claims
            await studentAPI.register({
                studentId: data.studentId,
                fullName: data.fullName,
                email: data.email,
                password: data.password,
                hallShortName: data.hallShortName,
                roomNumber: data.roomNumber,
                department: data.department,
                gender: data.gender,
            });

            // Now sign in normally — this gets us a Firebase session + fresh token with claims
            const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
            await fetchUserData(credential.user, true);

        } catch (err) {
            console.error(err);
            throw new Error(
                err instanceof Error ? err.message : "Registration failed",
                { cause: err }
            );

        }
    };
    const logout = async (): Promise<void> => {
        try {
            await firebaseSignOut(auth);

            setUser(null);
            setRole(null);
            setUserData(null);

            clearAuthState();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Logout error");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                userData,
                loading,
                error,
                isAuthenticated: !!user,

                login,
                register,

                getIdToken,
                refreshUserData,
                refreshProfile: refreshUserData,
                syncRoleWithDatabase,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};