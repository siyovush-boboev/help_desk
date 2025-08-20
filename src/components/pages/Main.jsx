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

    // load preload data once on mount
    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config)
            .then(() => setPreloadLoaded(true));
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config);
    }, []);

    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;
    if (error) return <div className="loader-wrapper"><div className="loader-wrapper"><p>{error}</p></div></div>;

    return (
        <>
            <Breadcrumbs text={config.plural} />
            <ControlBar
                showCreate
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], TABLE_PAGES_CONFIG["order"]["resource"])}
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
