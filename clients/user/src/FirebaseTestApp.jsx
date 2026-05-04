// clients/user/src/FirebaseTestApp.jsx
//
// A self-contained test panel that covers every auth operation.
// Drop this into App.jsx while testing: <FirebaseTestApp />
//
// Install dependencies first:
//   npm install firebase axios
//
// Replace YOUR_WEB_API_KEY below and configure firebase.js with your project values.

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    sendPasswordResetEmail, updatePassword, reauthenticateWithCredential,
    EmailAuthProvider, signOut
} from "firebase/auth";
import axios from "axios";

// ── Firebase client config (from .env) ────────────────────────
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// ─────────────────────────────────────────────────────────────────────────────

// backend base URL — from .env
const API = import.meta.env.VITE_API_BASE_URL;

// ── Axios helper — automatically attaches the Firebase ID Token ────────────
async function apiCall(method, path, data = null) {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
        console.log(`[API] ${method} ${API + path}`, { hasToken: !!token });
        const res = await axios({
            method,
            url: API + path,
            data,
            headers,
            timeout: 30000,
            validateStatus: () => true // Don't throw on any status code
        });

        console.log(`[API Response] Status: ${res.status}`, {
            statusText: res.statusText,
            dataType: typeof res.data,
            dataLength: res.data ? JSON.stringify(res.data).length : 0,
            headers: res.headers
        });

        if (res.status >= 200 && res.status < 300) {
            if (!res.data) {
                throw new Error(`Empty response body (Status: ${res.status})`);
            }
            return res.data;
        } else {
            throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data || res.statusText)}`);
        }
    } catch (e) {
        console.error(`[API Error] ${method} ${path}:`, {
            message: e.message,
            code: e.code,
            response: e.response ? {
                status: e.response.status,
                data: e.response.data,
                headers: e.response.headers
            } : 'No response'
        });
        throw e;
    }
}

// ── Small UI helpers ──────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
    <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12, color: "#666" }}>{label}</label>
        <input
            {...props}
            style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
                boxSizing: "border-box",
            }}
        />
    </div>
);

const Btn = ({ children, onClick, color = "#1a73e8", ...props }) => (
    <button
        onClick={onClick}
        style={{
            background: color,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 14,
            marginRight: 6,
        }}
        {...props}
    >
        {children}
    </button>
);

const Box = ({ title, children }) => (
    <div
        style={{
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
            background: "#fafafa",
        }}
    >
        <h3 style={{ margin: "0 0 14px", color: "#333" }}>{title}</h3>
        {children}
    </div>
);

const Result = ({ data }) => (
    <pre
        style={{
            background: "#1e1e1e",
            color: "#4ec9b0",
            padding: 12,
            borderRadius: 4,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 200,
            marginTop: 10,
        }}
    >
        {data ? JSON.stringify(data, null, 2) : "—"}
    </pre>
);




// ─────────────────────────────────────────────────────────────────────────────
//  Main test component
// ─────────────────────────────────────────────────────────────────────────────


export default function FirebaseTestApp() {
    const [currentUser, setCurrentUser] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const ok = (data) => {
        setResult(data);
        setError(null);
    };
    const err = (e) => {
        setError(e.message || JSON.stringify(e));
        setResult(null);
    };
    const setUser = async (user) => {
        setCurrentUser(user);
        if (user) {
            const token = await user.getIdToken();
            setIdToken(token);
        } else {
            setIdToken(null);
        }
    };

    // Listen for auth changes
    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return unsub;
    }, []);

    // ── 1. REGISTER (calls backend) ─────────────────────────────────────
    const [reg, setReg] = useState({
        studentId: "CE21012",
        fullName: "Alamgir Hosain",
        email: "ce21012@mbstu.ac.bd",
        password: "kirebeta",
        hallId: "", // You need to get a valid hallId from GET /api/v1/halls
        roomNumber: "112",
        department: "CSE",
        gender: "MALE",
    });

    const handleRegister = async () => {
        try {
            const res = await apiCall("POST", "/api/v1/students/register", reg);
            ok(res);
        } catch (e) {
            err(e);
        }
    };

    // ── 2. LOGIN (Firebase SDK — backend NOT called) ──────────────────────────
    const [login, setLogin] = useState({
        email: "ce21012@mbstu.ac.bd",
        password: "kirebeta",
    });

    const handleLogin = async () => {
        try {
            const userCred = await signInWithEmailAndPassword(
                auth,
                login.email,
                login.password
            );
            const token = await userCred.user.getIdToken();
            ok({ uid: userCred.user.uid, email: userCred.user.email, token });
        } catch (e) {
            err(e);
        }
    };

    // ── 3. GET PROFILE (calls backend with Firebase token) ───────────────
    const handleGetProfile = async () => {
        try {
            const res = await apiCall("GET", "/api/v1/students/profile");
            ok(res);
        } catch (e) {
            err(e);
        }
    };

    // ── 4. FORGOT PASSWORD (Firebase SDK — backend NOT called) ────────────────
    const [fpEmail, setFpEmail] = useState("ce21012@mbstu.ac.bd");

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, fpEmail);
            ok({ message: `Password reset email sent to ${fpEmail}` });
        } catch (e) {
            err(e);
        }
    };

    // ── 5. CHANGE PASSWORD (Firebase SDK — requires re-auth) ─────────────────
    const [cp, setCp] = useState({
        currentPassword: "kirebeta",
        newPassword: "kirebeta2",
    });

    const handleChangePassword = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");

            // Re-authenticate first
            const cred = EmailAuthProvider.credential(user.email, cp.currentPassword);
            await reauthenticateWithCredential(user, cred);

            // Now change password
            await updatePassword(user, cp.newPassword);
            ok({ message: "Password changed successfully" });
        } catch (e) {
            err(e);
        }
    };

    // ── 6. LOGOUT (Firebase SDK) ──────────────────────────────────────────────
    const handleLogout = async () => {
        try {
            await signOut(auth);
            ok({ message: "Logged out successfully" });
        } catch (e) {
            err(e);
        }
    };

    // ── 7. GET FRESH TOKEN  ───
    const handleRefreshToken = async () => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");
            const token = await user.getIdToken(true); // force refresh
            ok({ token });
        } catch (e) {
            err(e);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
            <h1 style={{ color: "#333", marginBottom: 24 }}>🔐 Firebase Auth Test Panel</h1>

            {/* Status bar */}
            <div
                style={{
                    background: "#e3f2fd",
                    border: "1px solid #90caf9",
                    borderRadius: 8,
                    padding: 14,
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#1565c0",
                }}
            >
                <strong>Status:</strong>{" "}
                {currentUser ? (
                    <>
                        ✅ Logged in as <strong>{currentUser.email}</strong>
                    </>
                ) : (
                    "❌ Not logged in"
                )}
            </div>

            {/* Register */}
            <Box title="1️⃣ Register Student">
                <Input
                    label="Student ID"
                    value={reg.studentId}
                    onChange={(e) => setReg({ ...reg, studentId: e.target.value })}
                />
                <Input
                    label="Full Name"
                    value={reg.fullName}
                    onChange={(e) => setReg({ ...reg, fullName: e.target.value })}
                />
                <Input
                    label="Email"
                    value={reg.email}
                    onChange={(e) => setReg({ ...reg, email: e.target.value })}
                />
                <Input
                    label="Password"
                    type="password"
                    value={reg.password}
                    onChange={(e) => setReg({ ...reg, password: e.target.value })}
                />
                <Input
                    label="Hall ID (UUID)"
                    value={reg.hallId}
                    onChange={(e) => setReg({ ...reg, hallId: e.target.value })}
                />
                <Input
                    label="Room Number"
                    value={reg.roomNumber}
                    onChange={(e) => setReg({ ...reg, roomNumber: e.target.value })}
                />
                <Input
                    label="Department"
                    value={reg.department}
                    onChange={(e) => setReg({ ...reg, department: e.target.value })}
                />
                <Input
                    label="Gender (MALE/FEMALE)"
                    value={reg.gender}
                    onChange={(e) => setReg({ ...reg, gender: e.target.value })}
                />
                <Btn onClick={handleRegister} color="#4caf50">
                    Register
                </Btn>
                {result && <Result data={result} />}
                {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
            </Box>

            {/* Login */}
            <Box title="2️⃣ Login">
                <Input
                    label="Email"
                    value={login.email}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                />
                <Input
                    label="Password"
                    type="password"
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                />
                <Btn onClick={handleLogin}>Login</Btn>
                {result && <Result data={result} />}
                {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
            </Box>

            {/* Get Profile */}
            {currentUser && (
                <Box title="3️⃣ Get Profile">
                    <p>Fetches your student profile from the backend.</p>
                    <Btn onClick={handleGetProfile}>Get Profile</Btn>
                    {result && <Result data={result} />}
                    {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
                </Box>
            )}

            {/* Forgot Password */}
            <Box title="4️⃣ Forgot Password">
                <Input
                    label="Email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                />
                <Btn onClick={handleForgotPassword} color="#ff9800">
                    Send Reset Email
                </Btn>
                {result && <Result data={result} />}
                {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
            </Box>

            {/* Change Password */}
            {currentUser && (
                <Box title="5️⃣ Change Password">
                    <Input
                        label="Current Password"
                        type="password"
                        value={cp.currentPassword}
                        onChange={(e) => setCp({ ...cp, currentPassword: e.target.value })}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        value={cp.newPassword}
                        onChange={(e) => setCp({ ...cp, newPassword: e.target.value })}
                    />
                    <Btn onClick={handleChangePassword} color="#ff9800">
                        Change Password
                    </Btn>
                    {result && <Result data={result} />}
                    {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
                </Box>
            )}

            {/* Logout */}
            {currentUser && (
                <Box title="6️⃣ Logout">
                    <Btn onClick={handleLogout} color="#f44336">
                        Logout
                    </Btn>
                    {result && <Result data={result} />}
                    {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
                </Box>
            )}

            {/* Refresh Token */}
            {currentUser && (
                <Box title="7️⃣ Refresh Token">
                    <p>Get a fresh Firebase ID token (useful for debugging).</p>
                    <Btn onClick={handleRefreshToken} color="#9c27b0">
                        Refresh Token
                    </Btn>
                    {result && <Result data={result} />}
                    {error && <div style={{ color: "red", marginTop: 10 }}>❌ {error}</div>}
                </Box>
            )}
        </div>
    );
}
