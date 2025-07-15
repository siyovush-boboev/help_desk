import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../layout/Breadcrumbs";
import ControlBar from "../../layout/ControlBar";
import DataTable from "../../layout/DataTable";
import Pagination from "../../layout/Pagination";
import { TABLE_PAGES_CONFIG, API_RESOURCES } from "../../../lib/pages";
import { onDelete, loadDataPreload, loadDataTable } from "../../../lib/utils/helpers.jsx";
import { ModalContext } from "../../../lib/contexts/ModalContext.js";
import FiltersModal from "../../layout/FiltersForm/index.jsx";

export default function Collections() {
    const { collectionName } = useParams(); // auto updates on URL change
    const config = TABLE_PAGES_CONFIG[collectionName];

    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const filtersFromUrl = useMemo(() => {
        const obj = {};
        searchParams.forEach((v, k) => {
            obj[k] = v.split(",");
        });
        return obj;
    }, [searchParams]);

    // Load preload when collectionName changes
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

        loadDataPreload(
            setPreload,
            setLoading,
            setError,
            API_RESOURCES,
            TABLE_PAGES_CONFIG,
            config
        );
    }, [collectionName, config]);

    // Load table data when collectionName or filters change
    useEffect(() => {
        if (!config) return;

        loadDataTable(
            setData,
            setLoading,
            setError,
            API_RESOURCES,
            config,
            filtersFromUrl
        );
    }, [collectionName, searchParams, filtersFromUrl, config]);

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
                showFilters={config.filters && config.filters.length > 0}
                showCreate
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
