import { useEffect, useState } from "react";
import Breadcrumbs from "../../layout/Breadcrumbs/index.jsx";
import ControlBar from "../../layout/ControlBar/index.jsx";
import DataTable from "../../layout/DataTable/index.jsx";
import { fetcher } from "../../../lib/services/api/httpClient.js";

export default function HomePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetcher({
                    url: "/main", // change to your real endpoint
                });
                setData(res);
            } catch (err) {
                console.error(err);
                setError("Failed to load data");
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
            <Breadcrumbs text="Главная" />
            <ControlBar
                showCreate
                onCreate={() => console.log("create logic")}
            />
            <DataTable>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </DataTable>
        </>
    );
}
