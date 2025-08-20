import { useEffect, useState } from "react";
import axios from "../../lib/contexts/axiosInstance";
import { BASE_URL, API_BASE_URL } from "../../lib/constants";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";

export default function OrderHistory({ orderId, data, status_preload }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/${TABLE_PAGES_CONFIG["order"]["resource"]}/${orderId}/history`);
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
    const statuses = Object.values(status_preload);

    console.log("history before processing:", history);

    history.forEach(entry => {
    // Default icon stays the same or empty if none
    let newIcon = entry.icon || "";

    // Update lines with links for attachments
    entry.lines = entry.lines.map(line => {
        if (typeof line === "string") {
        if (line.startsWith(attachment_line_suffix)) {
            console.log("Found attachment line:", line);
            const fileName = line.replace(attachment_line_suffix, "");
            const file_url = data?.attachments.find(att => att.file_name === fileName)?.url || "";
            return (
            <>
                {attachment_line_suffix}
                <a key={fileName} href={BASE_URL + file_url} target="_blank" rel="noopener noreferrer">
                {fileName}
                </a>
            </>
            );
        }

        // Check for status changed line and update icon here too
        if (line.startsWith("Статус изменен на:")) {
            const match = line.match(/«(.+?)»/);
            if (match) {
            const statusName = match[1].trim();
            const statusObj = statuses.find(s => s.name === statusName);
            if (statusObj) {
                newIcon = statusObj.icon_big;
            }
            }
        }
        }
        return line;
    });

    // After lines processed, assign new icon (or keep old if none found)
    entry.icon = newIcon;
    });

    return (
        <div className="order-history-wrapper">
            <p>Жизненный цикл</p>
            <div className="order-history">
                {history.map((entry, idx) => (
                    <div key={idx} className="history-entry">
                        <div className="entry-icon"><img src={BASE_URL + entry.icon} alt="icon" /></div>
                        <hr style={{ color: "#fff", borderStyle: "solid" }}></hr>
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
        </div>
    );
}
