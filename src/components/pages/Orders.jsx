import { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import DataTable from "../layout/DataTable";
import Pagination from "../layout/Pagination";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages.js";
import { onDelete, loadDataPreload, loadDataTable, onCreate } from "../../lib/utils/helpers.jsx";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import FiltersModal from "../layout/FiltersForm";
import UserInfoModal from "../layout/UserInfoModal";

const PAGE_NAME = "order";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];

export default function Orders() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [showClosed, setShowClosed] = useState(false);
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
                    Object.entries(newFilters).forEach(([k, v]) => { flat[k] = v.join(","); });

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
                showShowHide
                showCreate
                onDelete={() => onDelete(setModalContent, closeModal, null, config["resource"])}
                onFilter={onFilter}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], config["resource"])}
                showClosed={showClosed}
                setShowClosed={setShowClosed}
                onSearch={handleSearch}
                initialSearchValue={searchQuery} // sync input with URL param q
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
                onShowUser={onShowUser}
                showClosed={showClosed} // pass down to DataTable for filtering rows display
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
