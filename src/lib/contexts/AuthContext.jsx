// import { useState, useEffect } from "react";
import { useState } from "react";
import axios from "./axiosInstance";
import { AuthContext } from "./authContext.js";
// import { API_BASE_URL } from "../constants";
import {
    setAccessToken as setTokenManagerAccessToken,
    clearAccessToken as clearTokenManagerAccessToken,
} from "../services/api/tokenManager";


export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState(null);
    // const [loading, setLoading] = useState(false);
    const [loading,] = useState(false);
    const [authFailed, setAuthFailed] = useState(false);

    // useEffect(() => {
    //     const fetchInitialToken = async () => {
    //         try {
    //             const res = await axios.post(`${API_BASE_URL}/auth/refresh_token`, {}, { withCredentials: true });
    //             const token = res.data.body.accessToken;
    //             setAccessTokenState(token);
    //             setTokenManagerAccessToken(token);
    //             setAuthFailed(false);
    //         } catch (err) {
    //             console.error("Failed to fetch initial token:", err);
    //             clearTokenManagerAccessToken();
    //             setAuthFailed(true);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchInitialToken();
    // }, []);

    const setAccessToken = (token) => {
        setAccessTokenState(token);
        if (token) {
            setTokenManagerAccessToken(token);
        } else {
            clearTokenManagerAccessToken();
        }
    };

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
