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
    collectionName = collectionName.split("?")[0];
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
    const [refreshKey, setRefreshKey] = useState(0);
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

    const filtersFromUrl = useMemo(() => {
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            const match = key.match(/^filter\[(.+?)\]$/);
            if (match)
                filters[match[1]] = value.split(",");
            else
                filters[key] = value;
        }
        return filters;
    }, [searchParams]);

    const handleSearch = (term) => {
        setSearchParams({ ...Object.fromEntries(searchParams), search: term, page: 1, limit, withPagination: true });
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
        if (!config) {
            setError("Такой страницы не существует");
            setLoading(false);
            return;
        }
        loadDataTable(setData, setLoading, setError, config, filtersFromUrl);
    }, [collectionName, searchParams, filtersFromUrl, config, refreshKey]);

    const onFilter = () => {
        if (!config.filters || config.filters.length === 0) return;
        setModalContent(
            <FiltersModal
                filters={config.filters}
                preload={preload}
                defaultFilters={filtersFromUrl}
                onApply={(newFilters) => {
                    const flat = {};
                    Object.entries(newFilters).forEach(([k, v]) => { if (Array.isArray(v)) flat[`filter[${k}]`] = v.join(","); });
                    setSearchParams({ ...flat, withPagination: true, page: 1, limit, search: searchQuery });
                    closeModal();
                }}
                onClose={closeModal}
            />
        );
    };

    if (error) return <div className="loader-wrapper"><p>{error}</p></div>;
    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;

    // remove unnecessary statuses, only leave those with name "Активный" and "Неактивный"
    const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
    if (preload[status_field_key]) {
        preload[status_field_key] = Object.fromEntries(
            Object.entries(preload[status_field_key]).filter(([, item]) => item.type === 2)
        );
    }

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showFilters={config.filters && config.filters.length > 0}
                showCreate={permissions.includes(config.resource + ":create") || permissions.includes("superuser")}
                onSearch={handleSearch}
                initialSearchValue={searchQuery}
                onFilter={onFilter}
                onCreate={() => {
                        onCreate(setModalContent, closeModal, preload, FORM_CONFIG[collectionName], config["resource"], null, false, setRefreshKey);
                    }
                }
            />

            <DataTable
                columns={config.columns}
                data={data?.body || []}
                pageData={preload}
                onEdit={(id) => {
                    onCreate(
                        setModalContent,
                        closeModal,
                        preload,
                        FORM_CONFIG[collectionName],
                        config["resource"],
                        (data.body?.list || data.body).find((item) => item.id === id),
                        false,
                        setRefreshKey
                    );
                }}
                onDelete={(id) => {
                    onDelete(setModalContent, closeModal, id, config["resource"], setRefreshKey);
                }}
                showEdit={permissions.includes(config.resource + ":edit") || permissions.includes("superuser")}
                showDelete={permissions.includes(config.resource + ":delete") || permissions.includes("superuser")}
            />

            <Pagination
                totalItems={data?.body?.pagination?.total_count || data?.body?.length || 0}
                currentPage={currentPage || data?.body?.pagination?.page || 1}
                totalPages={data?.body?.pagination?.total_pages || 1}
                limit={limit || data?.body?.pagination?.limit || 10}
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
