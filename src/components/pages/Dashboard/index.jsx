import Header from "../../layout/Header/index.jsx";
import Navbar from "../../layout/Navbar/index.jsx";
import { useAuth } from "../../../lib/hooks/useAuth";
import { Navigate } from "react-router-dom";



export default function Dashboard() {
    const { accessToken, userRole, permissions } = useAuth();
    console.log("Dashboard userRole:", userRole);
    console.log("Dashboard permissions:", permissions);


    if (!accessToken) return <Navigate to="/login" replace />;

    return (
        <>
            <Header />

            <main>
                <Navbar />

                <div className="main-content">
                    <div className="breadcrumbs"></div>
                    <div className="controls"></div>
                    <div className="table-wrapper"></div>
                    <div className="pagination-container"></div>
                </div>
            </main>
        </>
    );
};
