import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../lib/contexts/authContext";

const ProtectedRoute = () => {
    const { accessToken, loading, authFailed } = useContext(AuthContext);
    const location = useLocation(); // get current URL

    if (loading) return <div className="loader-wrapper"><div className="loader-black"></div></div>;

    if (!accessToken || authFailed) {
        console.log("redirecting to login from ProtectedRoute");
        return (
            <Navigate
                to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
