import { useEffect, useState, useContext } from "react";
import Breadcrumbs from "../../layout/Breadcrumbs";
import ControlBar from "../../layout/ControlBar";
import DataTable from "../../layout/DataTable";
import { loadDataPreload, loadDataTable, onCreate } from "../../../lib/utils/helpers";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../../lib/pages";
import { ModalContext } from "../../../lib/contexts/ModalContext";


const PAGE_NAME = "main";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];

export default function MainPage() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);


    // load preload data once on mount
    useEffect(() => {
        loadDataPreload(setPreload, setLoading, setError, TABLE_PAGES_CONFIG, config);
    }, []);

    // load table data on URL filters change
    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config);
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />
            <ControlBar
                showCreate
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME])}
            />
            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                main_page={true}
            />
        </>
    );
}
