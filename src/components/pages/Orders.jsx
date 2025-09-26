import { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import DataTable from "../layout/DataTable";
import Pagination from "../layout/Pagination";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages.js";
import { onDelete, loadDataPreload, loadDataTable, onCreate as on_create_func } from "../../lib/utils/helpers.jsx";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import FiltersModal from "../layout/FiltersForm";
import UserInfoModal from "../layout/UserInfoModal";

const PAGE_NAME = "order";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];

export default function Orders() {
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    const navigate = useNavigate();
    if (!permissions.includes(`${PAGE_NAME}:view`)) {
        navigate("/main");
    }
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [showClosed, setShowClosed] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const searchQuery = searchParams.get("search") || "";
    const [refreshKey, setRefreshKey] = useState(0);
    const showDelete = permissions.includes(config["resource"] + ":delete");
    const showEdit = (permissions.includes(config["resource"] + ":update") && Object.keys(config.columns).includes("Действия"));
    // console.log("permissions from orders comp:", permissions);

    if (!(permissions.includes("scope:all"))) {
        // remove some filters from an array of banned ones
        let bannedFilters = ["department_id", "otdel_id"];
        if (!permissions.includes("scope:department")) bannedFilters.push("executor_id");

        config.filters = config.filters.filter(filter => !bannedFilters.includes(filter.id));
    }

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

    const handleSort = (column, direction) => {
        if (!column || !direction) return;
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

    const onShowUser = (userId) => {
        setModalContent(
            <UserInfoModal
                userId={userId}
                onClose={closeModal}
                departments={preload[TABLE_PAGES_CONFIG["department"]["singular"]]}
            />
        );
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

                    // check closed filter logic stays here if needed
                    const statusSingularKey = TABLE_PAGES_CONFIG["status"]?.singular;
                    let zakritoSelected = false;

                    if (
                        statusSingularKey &&
                        preload[statusSingularKey] &&
                        newFilters.status_id
                    ) {
                        const selectedStatusIds = newFilters.status_id.map(id => Number(id));
                        zakritoSelected = selectedStatusIds.some((id) => {
                            const statusObj = preload[statusSingularKey][id];
                            return statusObj?.name === "Закрыто";
                        });
                    }
                    setShowClosed(zakritoSelected);
                    setSearchParams({ ...flat, withPagination: true, page: 1, limit, search: searchQuery });
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
    }, [searchParams, filtersFromUrl, refreshKey]);

    if (error) return <div className="loader-wrapper"><p>{error}</p></div>;
    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;

    const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
    if (preload[status_field_key]) {
        preload[status_field_key] = Object.fromEntries(
            Object.entries(preload[status_field_key]).filter(([, item]) => [1, 3].includes(item.type))
        );
    }

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showDelete={showDelete && (config.columns["CHECKMARK"] === null)}
                showFilters={config.filters && config.filters.length > 0}
                showShowHide
                showCreate={permissions.includes(config["resource"] + ":create")}
                onDelete={() => onDelete(setModalContent, closeModal, null, config["resource"], setRefreshKey)}
                onFilter={onFilter}
                onCreate={() => on_create_func(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], config["resource"], null, false, setRefreshKey, PAGE_NAME)}
                showClosed={showClosed}
                setShowClosed={setShowClosed}
                onSearch={handleSearch}
                initialSearchValue={searchQuery}
                refk={setRefreshKey}
            />

            <DataTable
                columns={config.columns}
                data={data?.body || []}
                pageData={preload}
                onEdit={(id) => {
                    on_create_func(
                        setModalContent,
                        closeModal,
                        preload,
                        FORM_CONFIG[PAGE_NAME],
                        config["resource"],
                        (data.body?.list || data.body).find((item) => item.id === id),
                        true,
                        setRefreshKey,
                        PAGE_NAME,
                    )
                }}
                onShowUser={onShowUser}
                onSort={handleSort}
                showClosed={showClosed}
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