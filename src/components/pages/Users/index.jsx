import { useEffect, useState } from "react";
import Breadcrumbs from "../../layout/Breadcrumbs/index.jsx";
import ControlBar from "../../layout/ControlBar/index.jsx";
import DataTable from "../../layout/DataTable/index.jsx";
import Pagination from "../../layout/Pagination/index.jsx";
import { fetcher } from "../../../lib/services/api/httpClient.js";

export default function Users() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetcher({
                    url: "/user",
                });
                setData(res);
            } catch (err) {
                console.error(err);
                setError("Failed to load user data");
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
            <Breadcrumbs text="Пользователи" />
            <ControlBar
                showSearch
                showDelete
                showFilters
                showCreate
                onDelete={() => console.log("delete logic")}
                onFilter={() => console.log("filter logic")}
                onCreate={() => console.log("create logic")}
            />
            <DataTable>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </DataTable>
            <Pagination
                totalItems={data.length || 0}
                currentPage={1}
                onPageChange={() => console.log("Page changed")}
            />
        </>
    );
}
