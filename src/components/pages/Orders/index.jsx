import { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../layout/Breadcrumbs";
import ControlBar from "../../layout/ControlBar";
import DataTable from "../../layout/DataTable";
import Pagination from "../../layout/Pagination";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../../lib/pages";
import { onDelete, loadDataPreload, loadDataTable, onCreate } from "../../../lib/utils/helpers.jsx";
import { ModalContext } from "../../../lib/contexts/ModalContext.js";
import FiltersModal from "../../layout/FiltersForm";
import UserInfoModal from "../../layout/UserInfoModal";


const PAGE_NAME = "order";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];

export default function Orders() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const filtersFromUrl = useMemo(() => {
        const obj = {};
        searchParams.forEach((v, k) => { obj[k] = v.split(","); });
        return obj;
    }, [searchParams]);

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
                    setSearchParams(flat);
                }}
                onClose={closeModal}
            />
        );
    };

    useEffect(() => {
        loadDataPreload(setPreload, setLoading, setError, TABLE_PAGES_CONFIG, config);
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config, filtersFromUrl);
    }, [searchParams, filtersFromUrl]);

    if (loading) return <p>Загрузка...</p>;
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
                onDelete={() => onDelete(setModalContent, closeModal)}
                onFilter={onFilter}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME])}
            />

            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                onEdit={(id) => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], data?.result.find((item) => item.id === id))}
                onShowUser={onShowUser}
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
