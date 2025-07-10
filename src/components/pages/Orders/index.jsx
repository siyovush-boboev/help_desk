import { useEffect, useState } from "react";
import Breadcrumbs from "../../layout/Breadcrumbs/index.jsx";
import ControlBar from "../../layout/ControlBar/index.jsx";
import DataTable from "../../layout/DataTable/index.jsx";
import Pagination from "../../layout/Pagination/index.jsx";
import { fetcher } from "../../../lib/services/api/httpClient.js";

export default function Orders() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetcher({
                    url: "/order",
                });
                setData(res);
            } catch (err) {
                console.error(err);
                setError("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Breadcrumbs text="Заявки" />
            <ControlBar
                showSearch
                showDelete
                showFilters
                showShowHide
                showCreate
                onDelete={() => console.log("delete logic")}
                onFilter={() => console.log("filter logic")}
                onCreate={() => console.log("create logic")}
            />
            <DataTable>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </DataTable>
            <Pagination
                totalItems={420}
                currentPage={1}
                totalPages={10}
                initialPageSize={10}
                onPageChange={(page) => console.log("Page:", page)}
                onPageSizeChange={(size) => console.log("Size:", size)}
            />
        </>
    );
}
