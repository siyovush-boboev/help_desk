import { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import DataTable from "../layout/DataTable";
import Pagination from "../layout/Pagination";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages";
import { loadDataPreload, loadDataTable, onDelete, onCreate } from "../../lib/utils/helpers";
import { ModalContext } from "../../lib/contexts/ModalContext";
import FiltersModal from "../layout/FiltersForm";

const PAGE_NAME = "user";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];

export default function Users() {
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

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config).then(() => setPreloadLoaded(true));
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config, filtersFromUrl);
    }, [searchParams, filtersFromUrl]);

    if (loading || !preloadLoaded) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showDelete
                showFilters={config.filters && config.filters.length > 0}
                showCreate
                onDelete={() => onDelete(setModalContent, closeModal, null, config["resource"])}
                onFilter={onFilter}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], config["resource"])}
                onSearch={handleSearch}
                initialSearchValue={searchQuery}
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
                        FORM_CONFIG[PAGE_NAME],
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
                    setSearchParams({
                        ...Object.fromEntries(searchParams), page, pageSize, q: searchQuery,
                    });
                }}
                onPageSizeChange={(size) => {
                    setSearchParams({
                        ...Object.fromEntries(searchParams), page: 1, pageSize: size, q: searchQuery,
                    });
                }}
            />
        </>
    );
}
