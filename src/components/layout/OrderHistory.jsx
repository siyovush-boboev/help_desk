import { useEffect, useState } from "react";
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";

export default function OrderHistory({ orderId = 1023 }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/${orderId}/history`);
                setHistory(res.data?.result?.body || []);
            } catch (e) {
                console.error("❌ Error loading history:", e);
                setErr("Ошибка загрузки истории заявки");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [orderId]);

    if (loading) return <p>⏳ Подгружаем историю заявки...</p>;
    if (err) {
        console.error("Ошибка при загрузке истории:", err);
        return;
    };
    if (history.length === 0) return <p>🤷‍♂️ История пуста</p>;

    return (
        <div className="order-history">
            <p>Жизненный цикл</p>
            {history.map((entry, idx) => (
                <div key={idx} className="history-entry">
                    <div className="entry-icon">{entry.icon}</div>
                    <hr style={{ color: "red", borderStyle: "solid" }}></hr>
                    <div className="entry-info">
                        <div className="entry-meta">
                            <span className="entry-time">{entry.created_at}</span>&nbsp;&nbsp;
                            <strong className="entry-fio">{entry.actor?.fio}</strong>
                        </div>
                        <ul className="entry-lines">
                            {entry.lines.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
