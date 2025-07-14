import { useEffect, useState } from "react";
import Breadcrumbs from "../../layout/Breadcrumbs/index.jsx";
import ControlBar from "../../layout/ControlBar/index.jsx";
import DataTable from "../../layout/DataTable/index.jsx";
import Pagination from "../../layout/Pagination/index.jsx";
import { loadData } from "../../../lib/utils/helpers.jsx";
import { TABLE_PAGES_CONFIG, API_RESOURCES } from "../../../lib/pages.js";

const config = TABLE_PAGES_CONFIG["main"];

export default function MainPage() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData(setData, setPreload, setLoading, setError, API_RESOURCES, TABLE_PAGES_CONFIG, config);
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />
            <ControlBar
                showCreate
                onDelete={() => console.log("delete logic")}
                onFilter={() => console.log("filter logic")}
                onCreate={() => console.log("create logic")}
            />
            <DataTable
                columns={config.columns}
                data={data["result"]}
                pageData={preload}
                onEdit={(id) => console.log("edit", id)}
                onDelete={(id) => console.log("delete", id)}
                main_page={true}
            />
            <Pagination
                totalItems={data?.pagination?.totalItems || data["result"]?.length || 0}
                currentPage={data?.pagination?.currentPage || 1}
                totalPages={data?.pagination?.totalPages || 1}
                initialPageSize={data?.pagination?.pageSize || 10}
                onPageChange={(page) => console.log("Page:", page)}
                onPageSizeChange={(size) => console.log("Size:", size)}
            />
        </>
    );
}
