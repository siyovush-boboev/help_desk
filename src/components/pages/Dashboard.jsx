import { Outlet } from "react-router-dom";
import Header from "../layout/Header";
import Navbar from "../layout/Navbar";


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
