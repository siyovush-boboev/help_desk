import { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../layout/Breadcrumbs/index.jsx";
import ControlBar from "../../layout/ControlBar/index.jsx";
import DataTable from "../../layout/DataTable/index.jsx";
import Pagination from "../../layout/Pagination/index.jsx";
import { TABLE_PAGES_CONFIG, API_RESOURCES } from "../../../lib/pages.js";
import { loadDataPreload, loadDataTable, onDelete } from "../../../lib/utils/helpers.jsx";
import { ModalContext } from "../../../lib/contexts/ModalContext.js";
import FiltersModal from "../../layout/FiltersForm/index.jsx";

const config = TABLE_PAGES_CONFIG["user"];

export default function Users() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [searchParams, setSearchParams] = useSearchParams();

    // Parse filters from URL
    const filtersFromUrl = useMemo(() => {
        const obj = {};
        searchParams.forEach((v, k) => {
            obj[k] = v.split(",");
        });
        return obj;
    }, [searchParams]);

    // Load preload data
    useEffect(() => {
        loadDataPreload(
            setPreload,
            setLoading,
            setError,
            API_RESOURCES,
            TABLE_PAGES_CONFIG,
            config
        );
    }, []);

    // Load main table data
    useEffect(() => {
        loadDataTable(
            setData,
            setLoading,
            setError,
            API_RESOURCES,
            config,
            filtersFromUrl
        );
    }, [searchParams, filtersFromUrl]);

    const onFilter = () => {
        if (!config.filters || config.filters.length === 0) return;
        setModalContent(
            <FiltersModal
                filters={config.filters}
                preload={preload}
                defaultFilters={filtersFromUrl}
                onApply={(newFilters) => {
                    const flat = {};
                    Object.entries(newFilters).forEach(([k, v]) => {
                        flat[k] = v.join(",");
                    });
                    setSearchParams(flat);
                }}
                onClose={closeModal}
            />
        );
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showDelete
                showFilters={config.filters && config.filters.length > 0}
                showCreate
                onDelete={() => onDelete(setModalContent, closeModal)}
                onFilter={onFilter}
                onCreate={() => console.log("create logic")}
            />

            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                onEdit={(id) => console.log("edit", id)}
                onDelete={(id) => onDelete(setModalContent, closeModal, id)}
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
