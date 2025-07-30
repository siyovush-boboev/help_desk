import { useEffect, useState } from "react";
import axios from "./axiosInstance";
import { AuthContext } from "./authContext";
import { API_BASE_URL } from "../constants";
import {
    setAccessToken as setTokenManagerAccessToken,
    clearAccessToken as clearTokenManagerAccessToken,
} from "../services/api/tokenManager";


export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessTokenState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authFailed, setAuthFailed] = useState(false);

    useEffect(() => {
        const fetchInitialToken = async () => {
            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                const token = res.data.body.access_token;
                setAccessTokenState(token);
                setTokenManagerAccessToken(token);
                setAuthFailed(false);
            } catch (err) {
                console.error("Failed to fetch initial token:", err);
                clearTokenManagerAccessToken();
                setAuthFailed(true); // 👈 FLAG
            } finally {
                setLoading(false);
            }
        };
        fetchInitialToken();
    }, []);

    const setAccessToken = (token) => {
        setAccessTokenState(token);
        if (token) {
            setTokenManagerAccessToken(token);
        } else {
            clearTokenManagerAccessToken();
        }
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, loading, authFailed, setAuthFailed }}>
            {loading ? <div>Загрузка...</div> : children}
        </AuthContext.Provider>
    );
};
