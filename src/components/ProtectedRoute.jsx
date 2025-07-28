import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../lib/contexts/authContext";

const ProtectedRoute = () => {
    const { accessToken, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
