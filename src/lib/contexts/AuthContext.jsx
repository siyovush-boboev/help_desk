import { useState, useEffect, useCallback } from "react";
import axios from "./axiosInstance"; // your custom axios instance (we’ll make next)
import { AuthContext } from "./authContext";
import { API_BASE_URL } from "../constants";
import { setAccessToken as setTokenManagerAccessToken, clearAccessToken as clearTokenManagerAccessToken } from "../services/api/tokenManager";


export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshAccessToken = useCallback(async () => {
        try {
            const res = await axios.post(API_BASE_URL + "/auth/refresh");
            setAccessTokenState(res.data.access_token);
            setTokenManagerAccessToken(res.data.access_token);
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
        <AuthContext.Provider value={{ accessToken, setAccessToken, refreshAccessToken, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
