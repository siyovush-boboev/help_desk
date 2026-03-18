import { useMemo, useState } from "react";
import axios from "../../lib/contexts/axiosInstance";


function getCorrectSpelling(n) {
    let res = `${n} элемент`;
    if (n == 1)
        return res;
    if (n > 1 && n < 5)
        return res + "а";
    return res + "ов";
}


export default function DeleteForm({
    data = [],
    onClose,
    id = null,
    url,
    trigger_table_reload
}) {
    const [loading, setLoading] = useState(false);

    const prepped_data = useMemo(() => {
        const ids = (data ?? [])
            .map(item => item?.getAttribute?.("row-id"))
            .filter(id => id != null && id !== "");

        if (ids.length === 0 && id != null) {
            return [id];
        }

        return ids;
    }, [data, id]);

    const deleteItem = (itemId) => {
        return axios.delete(`/${url}/${itemId}`);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();

        if (prepped_data.length === 0 || loading) return;

        try {
            setLoading(true);

            await Promise.all(prepped_data.map(deleteItem));

            if (typeof trigger_table_reload === "function") {
                trigger_table_reload();
            }

            onClose?.();
        } catch (error) {
            console.error("Error deleting items:", error);
        } finally {
            setLoading(false);
        }
    };

    if (prepped_data.length === 0) return null;

    return (
        <div className="modal-form">
            <p>
                Вы уверены что хотите удалить элемент с id&nbsp;
                {prepped_data[0]}
                {prepped_data.length > 1 &&
                    ` и еще ${getCorrectSpelling(prepped_data.length - 1)}`}?
            </p>

            <div className="modal-buttons">
                <button
                    id="confirmBtn"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? "Удаление..." : "Подтвердить"}
                </button>

                <button
                    id="cancelBtn"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!loading) onClose?.();
                    }}
                    disabled={loading}
                >
                    Отмена
                </button>
            </div>
        </div>
    );
}