import { useState, useEffect } from "react";
import axios from "./axiosInstance";
import { AuthContext } from "./authContext.js";
import {
    setAccessToken as setTokenManagerAccessToken,
    clearAccessToken as clearTokenManagerAccessToken,
    clearUserLocalStorage,
} from "../services/api/tokenManager";


export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authFailed, setAuthFailed] = useState(false);

    const setAccessToken = (token) => {
        setAccessTokenState(token);
        if (token) {
            setTokenManagerAccessToken(token);
        } else {
            clearTokenManagerAccessToken();
        }
    };

    // On mount (including a plain F5), the access token in memory is gone — try to
    // restore the session from the httpOnly refresh cookie before ProtectedRoute
    // gets a chance to see accessToken=null and bounce to /login.
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await axios.post("/auth/refresh_token", {}, { withCredentials: true });
                const { accessToken: token, permissions } = res.data.body;
                setAccessToken(token);
                localStorage.setItem("permissions", JSON.stringify(permissions));
                setAuthFailed(false);
            } catch (err) {
                console.error("Failed to restore session:", err);
                setAccessToken(null);
                clearUserLocalStorage();
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    async function logout() {
        try {
            await axios.post('/auth/logout', {}, { withCredentials: true }); // hits backend to clear cookie
        } catch (e) {
            console.error("Logout error", e);
        }
        setAccessToken(null); // clear token from state so user is logged out locally
    }


    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, loading, authFailed, setAuthFailed, logout }}>
            {loading ? <div className="loader-wrapper" style={{ width: "100vw", height: "100vh" }}><div className="loader-black"></div></div> : children}
        </AuthContext.Provider>
    );
};
