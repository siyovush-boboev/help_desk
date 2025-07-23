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
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const pageSize = parseInt(searchParams.get("pageSize")) || 10;
    const searchQuery = searchParams.get("q") || "";

    const filtersFromUrl = useMemo(
        () => Object.fromEntries([...searchParams].map(([k, v]) => [k, v.split(",")])),
        [searchParams]
    );
    const handleSearch = (term) => {
        setSearchParams({ ...Object.fromEntries(searchParams), q: term, page: 1, pageSize, });
    };

    useEffect(() => {
        if (!config) {
            setError("Такой страницы не существует");
            setLoading(false);
            return;
        }

        setData([]); setPreload({}); setError(""); setPreloadLoaded(false); setLoading(true);

        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config)
            .then(() => setPreloadLoaded(true));
    }, [collectionName, config]);

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
                    setSearchParams({ ...flat, page: 1, pageSize, q: searchQuery, });
                    closeModal();
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
                onSearch={handleSearch}
                initialSearchValue={searchQuery}
                onFilter={onFilter}
                onCreate={() =>
                    onCreate(setModalContent, closeModal, preload, FORM_CONFIG[collectionName], config["resource"])
                }
            />

            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                onEdit={(id) =>
                    onCreate(
                        setModalContent,
                        closeModal,
                        preload,
                        FORM_CONFIG[collectionName],
                        config["resource"],
                        data?.result.find((item) => item.id === id)
                    )
                }
                onDelete={(id) => onDelete(setModalContent, closeModal, id, config["resource"])}
            />

            <Pagination
                totalItems={data?.pagination?.totalItems || data["result"]?.length || 0}
                currentPage={currentPage}
                totalPages={data?.pagination?.totalPages || 1}
                pageSize={pageSize}
                onPageChange={(page) => {
                    setSearchParams({ ...Object.fromEntries(searchParams), page, pageSize, q: searchQuery, });
                }}
                onPageSizeChange={(size) => {
                    setSearchParams({ ...Object.fromEntries(searchParams), page: 1, pageSize: size, q: searchQuery, });
                }}
            />
        </>
    );
}
