import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../lib/contexts/authContext";

const ProtectedRoute = () => {
    const { accessToken, loading, authFailed } = useContext(AuthContext);

    if (loading) return <div className="loader-wrapper"><div className="loader"></div></div>;

    if (!accessToken || authFailed) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
