import { useEffect, useState, useContext } from "react";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import DataTable from "../layout/DataTable";
import { loadDataPreload, loadDataTable, onCreate } from "../../lib/utils/helpers";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages";
import { ModalContext } from "../../lib/contexts/ModalContext";


const PAGE_NAME = "main";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];

export default function Main() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config)
            .then(() => setPreloadLoaded(true));
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config);
    }, [refreshKey]);

    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;
    if (error) return <div className="loader-wrapper"><div className="loader-wrapper"><p>{error}</p></div></div>;

    // remove unnecessary statuses
    const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
    if (preload[status_field_key]) {
        preload[status_field_key] = Object.fromEntries(
            Object.entries(preload[status_field_key]).filter(([, item]) => [1,3].includes(item.type))
        );
    }

    return (
        <>
            <Breadcrumbs text={config.plural} />
            <ControlBar
                showCreate={permissions.includes("order:create") || permissions.includes("superuser")}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], TABLE_PAGES_CONFIG["order"]["resource"], null, false, setRefreshKey)}
            />
            <DataTable
                columns={config.columns}
                data={data?.body || []}
                pageData={preload}
                main_page={true}
            />
        </>
    );
}
