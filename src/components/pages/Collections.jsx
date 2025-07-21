import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import DataTable from "../layout/DataTable";
import Pagination from "../layout/Pagination";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages.js";
import { onDelete, loadDataPreload, loadDataTable, onCreate } from "../../lib/utils/helpers.jsx";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import FiltersModal from "../layout/FiltersForm";


export default function Collections() {
    const { collectionName } = useParams(); // auto updates on URL change
    const config = TABLE_PAGES_CONFIG[collectionName];

    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [preloadLoaded, setPreloadLoaded] = useState(false);


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

        setData([]); setPreload({}); setError(""); setPreloadLoaded(false); setLoading(true);

        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config)
            .then(() => {
                setPreloadLoaded(true);
            });
    }, [collectionName, config]);

    // Load table data when collectionName or filters change
    useEffect(() => {
        if (!config) return;
        loadDataTable(setData, setLoading, setError, config, filtersFromUrl);
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
                    Object.entries(newFilters).forEach(([k, v]) => { flat[k] = v.join(","); });
                    setSearchParams(flat);
                }}
                onClose={closeModal}
            />
        );
    };


    if (loading || !preloadLoaded) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showFilters={config.filters && config.filters.length > 0}
                showCreate
                onFilter={onFilter}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[collectionName])}
            />

            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                onEdit={(id) => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[collectionName], data?.result.find((item) => item.id === id))}
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
