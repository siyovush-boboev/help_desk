import { useState, useEffect } from "react";
import { getNewAccessToken } from "../services/api/authApi";
import { AuthContext } from "./authBS"


export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [permissions, setPermissions] = useState([]);

    const refreshAccessToken = async () => {
        try {
            const token = await getNewAccessToken();
            setAccessToken(token);
        } catch (err) {
            console.error("Failed to refresh access token:", err);
            setAccessToken(null);
        }
    };

    useEffect(() => {
        refreshAccessToken().finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{
            accessToken, setAccessToken, refreshAccessToken, userRole,
            setUserRole,
            permissions,
            setPermissions,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
