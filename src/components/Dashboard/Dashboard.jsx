import Header from "../Header/Header.jsx";
import Navbar from "../Navbar/Navbar.jsx";

export default function Dashboar() {
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

            <div id="user_type" style={{ display: "none" }}>
                admin
            </div>
        </>
    );
};
