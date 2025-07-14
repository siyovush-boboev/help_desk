import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../../layout/Breadcrumbs";
import ControlBar from "../../layout/ControlBar";
import DataTable from "../../layout/DataTable";
import Pagination from "../../layout/Pagination";
import { TABLE_PAGES_CONFIG, API_RESOURCES } from "../../../lib/pages";
import { onDelete, loadData } from "../../../lib/utils/helpers.jsx";
import { ModalContext } from "../../../lib/contexts/ModalContext.js";



export default function Collections() {
    const { collectionName } = useParams(); // auto updates on URL change
    const config = TABLE_PAGES_CONFIG[collectionName];

    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);


    useEffect(() => {
        if (!config) {
            setError("Такой страницы не существует");
            setLoading(false);
            return;
        }

        setData([]);
        setPreload({});
        setLoading(true);
        setError("");

        loadData(
            setData,
            setPreload,
            setLoading,
            setError,
            API_RESOURCES,
            TABLE_PAGES_CONFIG,
            config
        );
    }, [collectionName, config]); // <-- rerun when URL param changes

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showFilters
                showCreate
                onFilter={() => console.log("filter logic")}
                onCreate={() => console.log("create logic")}
            />

            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                onEdit={(id) => console.log("edit", id)}
                onDelete={(id) => (onDelete(setModalContent, closeModal, id))}
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
