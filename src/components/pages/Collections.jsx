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
    let { collectionName } = useParams(); // auto updates on URL change
    collectionName = Object.keys(TABLE_PAGES_CONFIG).find(
        key => TABLE_PAGES_CONFIG[key].resource.toLowerCase() === collectionName.toLowerCase()
    );
    const config = TABLE_PAGES_CONFIG[collectionName];
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const searchQuery = searchParams.get("search") || "";

    const filtersFromUrl = useMemo(
        () => Object.fromEntries([...searchParams].map(([k, v]) => [k, v.split(",")])),
        [searchParams]
    );
    const handleSearch = (term) => {
        setSearchParams({ ...Object.fromEntries(searchParams), search: term, page: 1, limit, });
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
                    setSearchParams({ ...flat, page: 1, limit, search: searchQuery, });
                    closeModal();
                }}
                onClose={closeModal}
            />
        );
    };

    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader"></div></div>;
    if (error) return <div className="loader-wrapper"><p>{error}</p></div>;

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
                data={data?.body || []}
                pageData={preload}
                onEdit={(id) =>
                    onCreate(
                        setModalContent,
                        closeModal,
                        preload,
                        FORM_CONFIG[collectionName],
                        config["resource"],
                        data?.body.find((item) => item.id === id)
                    )
                }
                onDelete={(id) => onDelete(setModalContent, closeModal, id, config["resource"])}
            />

            <Pagination
                totalItems={data?.body?.pagination?.total_count || data?.body?.length || 0}
                currentPage={currentPage}
                totalPages={data?.body?.pagination?.total_pages || 1}
                limit={limit}
                onPageChange={(page) => {
                    setSearchParams({ ...Object.fromEntries(searchParams), page, limit, search: searchQuery, withPagination: true });
                }}
                onPageSizeChange={(size) => {
                    setSearchParams({ ...Object.fromEntries(searchParams), page: 1, limit: size, search: searchQuery, withPagination: true });
                }}
            />
        </>
    );
}
