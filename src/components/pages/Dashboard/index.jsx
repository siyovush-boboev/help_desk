import Breadcrumbs from "../../layout/Breadcrumbs/index.jsx";
import Controls from "../../layout/ControlBar/index.jsx";
import DataTable from "../../layout/DataTable/index.jsx";
import Pagination from "../../layout/Pagination/index.jsx";
import Header from "../../layout/Header/index.jsx";
import Navbar from "../../layout/Navbar/index.jsx";


export default function Dashboard() {

    return (
        <>
            <Header />

            <main>
                <Navbar></Navbar>

                <div className="main-content">
                    <Breadcrumbs text="bull/shit"></Breadcrumbs>
                    <Controls>
                        <p>controls</p>
                    </Controls>
                    <DataTable>
                        <p>fn table</p>
                    </DataTable>
                    <Pagination totalItems={12} currentPage={1} onPageChange={() => (console.log("page +-"))}></Pagination>
                </div>
            </main>
        </>
    );
};
