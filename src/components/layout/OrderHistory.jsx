import React, { useEffect, useRef } from "react";

import { BASE_URL } from "../../lib/constants";


export default function OrderHistory({ history, data, status_preload }) {
    const orderHistoryRef = useRef(null);

    useEffect(() => {
        if (orderHistoryRef.current) {
            orderHistoryRef.current.scrollTop = orderHistoryRef.current.scrollHeight;
        }
    }, [history]); // Re-run this effect whenever the 'history' prop changes

    if (history.length === 0)
        return <div className="order-history-wrapper">
                   <p>Жизненный цикл</p>
                   <div className="order-history" ref={orderHistoryRef}>
                       <p>🤷‍♂️ История пуста</p>
                   </div>
               </div>;

    if (history[0] === "loading msg")
        return <div className="order-history-wrapper">
                    <p>Жизненный цикл</p>
                    <div className="order-history" ref={orderHistoryRef}>
                        <p>⏳ загрузка истории заявки...</p>
                    </div>
                </div>;

    if (history[0] === "error msg")
        return <div className="order-history-wrapper">
                    <p>Жизненный цикл</p>
                    <div className="order-history" ref={orderHistoryRef}>
                        <p>Ошибка загрузки истории</p>
                    </div>
                </div>;

    // prepare history entries with files
    const attachment_line_suffix = "Прикреплен файл: ";
    const statuses = Object.values(status_preload);

    let prev_icon = "";
    // find the icon for "Открыто" status and set it by default
    statuses.forEach(status => {
        if (status.name === "Открыто") {
            prev_icon = BASE_URL + status.icon_small;
        }
    });
    history.forEach(entry => {
        // Default icon stays the same or empty if none
        let newIcon = "";
        if (entry.comment && !entry.lines.includes(entry.comment)) {
            entry.lines.push(entry.comment);
        }

        // Update lines with links for attachments
        entry.lines = entry.lines.map(line => {
            if (typeof line === "string") {
                if (line.startsWith(attachment_line_suffix)) {
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
                if (line.includes(":") && line.toLowerCase().includes("статус")) {
                    const match = line.match(/«(.+?)»/);
                    if (match) {
                        const statusName = match[1].trim();
                        const statusObj = statuses.find(s => s.name === statusName);
                        if (statusObj) {
                            newIcon = BASE_URL + statusObj.icon_small;
                        }
                    }
                }
            }
            return line;
        });

        // After lines processed, assign new icon (or keep old if none found)
        if (newIcon){
            entry.icon = newIcon;
            prev_icon = newIcon;
        }
        else {
            entry.icon = prev_icon;
        }
    });

    return (
        <div className="order-history-wrapper">
            <p>Жизненный цикл</p>
            <div className="order-history" ref={orderHistoryRef}>
                {history.map((entry, idx) => (
                    <div key={idx} className="history-entry">
                        <div className="entry-icon"><img src={entry.icon || null} alt="icon" /></div>
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
