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
                onCreate={() => console.log("create logic")}
            />
            <DataTable
                columns={config.columns}
                data={data["result"]}
                pageData={preload}
                main_page={true}
            />
        </>
    );
}
