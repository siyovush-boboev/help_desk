import { useAuth } from "../lib/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { accessToken } = useAuth();

    if (!accessToken) return <Navigate to="/login" replace />;
    return children;
}
