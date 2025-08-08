import { useEffect, useState } from "react";
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";

export default function OrderHistory({ orderId, data }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/${TABLE_PAGES_CONFIG["order"]["resource"]}/${orderId}/history`);
                console.log("res", res);
                setHistory(res.data?.body || []);
            } catch (e) {
                console.error("❌ Error loading history:", e);
                setErr("Ошибка загрузки истории заявки");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [orderId]);

    if (loading)
        return <div className="order-history">
            <p>Жизненный цикл</p>
            <p>⏳ загрузка истории заявки...</p>
        </div>;
    if (err) {
        console.error("Ошибка при загрузке истории:", err);
        return;
    };
    if (history.length === 0)
        return <div className="order-history">
            <p>Жизненный цикл</p>
            <p>🤷‍♂️ История пуста</p>
        </div>;

    // prepare history entries with files
    const attachment_line_suffix = "Прикреплен файл: ";
    history.forEach(entry => {
        entry.lines = entry.lines.map(line => {
            if (line?.startsWith(attachment_line_suffix)) {
                console.log("Found attachment line:", line);
                const fileName = line.replace(attachment_line_suffix, "");
                // get file link
                const file_url = data?.attachments.find(att => att.file_name === fileName)?.url || "";
                return (
                    <>
                        {attachment_line_suffix}
                        <a key={fileName} href={file_url} target="_blank" rel="noopener noreferrer">
                            {fileName}
                        </a>
                    </>
                );
            }
            return line;
        });
    });
    console.log(data);

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
