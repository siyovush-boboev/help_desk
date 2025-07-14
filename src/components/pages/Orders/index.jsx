import { useEffect, useState, useContext } from "react";
import Breadcrumbs from "../../layout/Breadcrumbs";
import ControlBar from "../../layout/ControlBar";
import DataTable from "../../layout/DataTable";
import Pagination from "../../layout/Pagination";
import { TABLE_PAGES_CONFIG, API_RESOURCES } from "../../../lib/pages";
import { ModalContext } from "../../../lib/contexts/ModalContext.js";
import UserInfoModal from "../../layout/UserInfoModal/index.jsx";
import { onDelete, loadData } from "../../../lib/utils/helpers.jsx";


const config = TABLE_PAGES_CONFIG["order"];

export default function Orders() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);

    const onShowUser = (userId) => {
        setModalContent(
            <UserInfoModal userId={userId} onClose={closeModal} departments={preload[TABLE_PAGES_CONFIG["department"]["singular"]]} />
        );
    };

    useEffect(() => {
        loadData(setData, setPreload, setLoading, setError, API_RESOURCES, TABLE_PAGES_CONFIG, config);
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showSearch
                showDelete
                showFilters
                showShowHide
                showCreate
                onDelete={() => (onDelete(setModalContent, closeModal))}
                onFilter={() => console.log("filter logic")}
                onCreate={() => console.log("create logic")}
            />

            <DataTable
                columns={config.columns}
                data={data?.result || []}
                pageData={preload}
                onEdit={(id) => console.log("edit", id)}
                onDelete={(id) => console.log("delete", id)}
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
