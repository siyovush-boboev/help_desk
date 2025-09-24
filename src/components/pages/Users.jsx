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
    const limit = parseInt(searchParams.get("limit")) || 10;
    const searchQuery = searchParams.get("search") || "";
    const [refreshKey, setRefreshKey] = useState(0);
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    const showDelete = permissions.includes(config["resource"] + ":delete");
    const showEdit = (permissions.includes(config["resource"] + ":update") && Object.keys(config.columns).includes("Действия"));
    // console.log("permissions from users comp:", permissions);

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
        setSearchParams({ ...Object.fromEntries(searchParams), search: term, limit, page: 1, withPagination: true });
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
                    Object.entries(newFilters).forEach(([k, v]) => { if (Array.isArray(v)) flat[`filter[${k}]`] = v.join(","); });
                    setSearchParams({ ...flat, withPagination: true, page: 1, limit, search: searchQuery });
                    closeModal();
                }}
                onClose={closeModal}
            />
        );
    };

    const handleSort = (column, direction) => {
        console.log("Sorting by:", column, direction);
        const currentParams = Object.fromEntries(searchParams);

        // Remove any keys like "sort[...]" from current params
        const filteredParams = Object.fromEntries(
            Object.entries(currentParams).filter(([key]) => !key.startsWith("sort["))
        );

        // Add the new sort param and other required params
        setSearchParams({
            ...filteredParams,
            [`sort[${column}]`]: direction.toUpperCase(),
            withPagination: true,
            page: 1,
            limit,
        });
    };

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config).then(() => setPreloadLoaded(true));
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config, filtersFromUrl);
    }, [searchParams, filtersFromUrl, refreshKey]);

    if (error) return <div className="loader-wrapper"><p>{error}</p></div>;
    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;

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
                showCreate={permissions.includes("user:create")}
                showDelete={showDelete && (config.columns["CHECKMARK"] === null)}
                onFilter={onFilter}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], config["resource"], null, false, setRefreshKey, PAGE_NAME)}
                onSearch={handleSearch}
                initialSearchValue={searchQuery}
                refk={setRefreshKey}
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
                        FORM_CONFIG[PAGE_NAME],
                        config["resource"],
                        (data.body?.list || data.body).find((item) => item.id === id),
                        false,
                        setRefreshKey,
                        PAGE_NAME,
                    )
                }
                onDelete={(id) => onDelete(setModalContent, closeModal, id, config["resource"], setRefreshKey)}
                onSort={handleSort}
                showEdit={showEdit}
                showDelete={showDelete}
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
