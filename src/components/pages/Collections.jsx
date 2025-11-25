import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    const config = TABLE_PAGES_CONFIG[collectionName];
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const searchQuery = searchParams.get("search") || "";
    const [refreshKey, setRefreshKey] = useState(0);
    const showDelete = permissions.includes(config["resource"] + ":delete");
    const showEdit = (permissions.includes(config["resource"] + ":update") && Object.keys(config.columns).includes("Действия"));
    
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

    // redirect to /main if user should not see this page
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
    
    const handleSearch = (term) => {
        setSearchParams({ ...Object.fromEntries(searchParams), search: term, page: 1, limit, withPagination: true });
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
    

    const onFilterApply = (newFilters) => {
        const flat = {};
        Object.entries(newFilters).forEach(([k, v]) => { if (Array.isArray(v)) flat[`filter[${k}]`] = v.join(","); });
        setSearchParams({ ...flat, withPagination: true, page: 1, limit, search: searchQuery });
        closeModal();
    };

    const onFilter = () => {
        if (!config.filters || config.filters.length === 0) return;
        setModalContent(
            <FiltersModal
                filters={config.filters}
                preload={preload}
                defaultFilters={filtersFromUrl}
                onApply={onFilterApply}
                onClose={closeModal}
            />
        );
    };

    const navigate = useNavigate();
    if (!(permissions.includes(`${collectionName}:update`) || permissions.includes(`${collectionName}:create`) || permissions.includes(`${collectionName}:delete`))) {
        navigate("/dashboard");
        return;
    }
    
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
                showCreate={permissions.includes(config.resource + ":create")}
                showDelete={showDelete && (config.columns["CHECKMARK"] === null)}
                onSearch={handleSearch}
                onDelete={() => onDelete(setModalContent, closeModal, null, config["resource"], setRefreshKey)}
                initialSearchValue={searchQuery}
                onFilter={onFilter}
                onCreate={() => {
                        onCreate(setModalContent, closeModal, preload, FORM_CONFIG[collectionName], config["resource"], null, false, setRefreshKey, collectionName);
                    }
                }
                equipmentProps={collectionName === "equipment" && preload["Тип оборудования"]
                     ? [preload["Тип оборудования"], filtersFromUrl, onFilterApply]
                     : [{}, {}, () => {}]
                }
                refk={setRefreshKey}
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
                        setRefreshKey,
                        collectionName,
                    );
                }}
                onDelete={(id) => {
                    onDelete(setModalContent, closeModal, id, config["resource"], setRefreshKey);
                }}
                onSort={handleSort}
                showEdit={showEdit}
                showDelete={showDelete}
            />

            <Pagination
                totalItems={data?.pagination?.total_count || data?.body?.length || 0}
                currentPage={currentPage || data?.pagination?.page || 1}
                totalPages={data?.pagination?.total_pages || 1}
                limit={limit || data?.pagination?.limit || 20}
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
