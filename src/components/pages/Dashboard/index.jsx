import { Outlet } from "react-router-dom";
import Header from "../../layout/Header/index.jsx";
import Navbar from "../../layout/Navbar/index.jsx";


export default function Dashboard() {
    return (
        <>
            <Header />
            <main>
                <Navbar></Navbar>
                <div className="main-content">
                    <Outlet />
                </div>
            </main>
        </>
    );
};
