import { useState, useEffect, useCallback } from "react";
import axios from "./axiosInstance"; // your custom axios instance (we’ll make next)
import { AuthContext } from "./authContext";
import { API_BASE_URL } from "../constants";
import { setAccessToken as setTokenManagerAccessToken, clearAccessToken as clearTokenManagerAccessToken } from "../services/api/tokenManager";


export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    const refreshAccessToken = useCallback(async () => {
        try {
            const res = await axios.post(API_BASE_URL + "/auth/refresh");
            setAccessTokenState(res.data.body.access_token);
            setTokenManagerAccessToken(res.data.body.access_token);
            setUserData(res.data.body.user);
            return true;
        } catch {
            setAccessTokenState(null);
            clearTokenManagerAccessToken();
            return false;
        }
    }, []);

    useEffect(() => {
        refreshAccessToken().finally(() => setLoading(false));
    }, [refreshAccessToken]);

    // Sync context state token to token manager
    const setAccessToken = (token) => {
        setAccessTokenState(token);
        if (token) {
            setTokenManagerAccessToken(token);
        } else {
            clearTokenManagerAccessToken();
        }
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, refreshAccessToken, loading, userData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
