import { DeleteTableRowIcon, EditTableRowIcon } from "../../ui/icons.jsx";


export default function DataTable({
    columns = {},
    data = [],
    pageData = {},
    onEdit = () => { },
    onDelete = () => { },
    onShowUser = () => { },
    main_page = false,
}) {
    const handleSelectAll = (e) => {
        const checkboxes = document.querySelectorAll(".custom-table tbody input[type='checkbox']");
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    };
    const main_page_sums = { "Открыто": 0, "Закрыто": 0, "total": 0 };


    return (
        <div className="table-wrapper">
            <table className="custom-table">
                <thead>
                    <tr>
                        {main_page && <th>-</th>}
                        {Object.keys(columns).map((col) => (
                            <th key={col}>
                                {col === "CHECKMARK" ? (
                                    <input
                                        type="checkbox"
                                        id="select-all"
                                        title="Выбрать все"
                                        onChange={handleSelectAll}
                                    />
                                ) : col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, i) => {
                        let hideRow = false;

                        const tds = Object.entries(columns).map(([colName, field]) => {
                            if (colName === "CHECKMARK") {
                                return (
                                    <td key={i + colName}><input type="checkbox" /></td>
                                );
                            }

                            else if (colName === "№") {
                                return <td key={i + colName}>{item["id"] || i + 1}</td>;
                            }

                            else if (colName === "Действия") {
                                return (
                                    <td key={i + colName}>
                                        <div className="table-actions">
                                            <button id="table-delete-button" onClick={() => onDelete(item.id)}><DeleteTableRowIcon /></button>
                                            <button id="table-edit-button" onClick={() => onEdit(item.id)}><EditTableRowIcon /></button>
                                        </div>
                                    </td>
                                );
                            }

                            else if (colName === "Наименование заявки") {
                                return (
                                    <td key={i + colName}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onEdit(item.id); }}>
                                            {item[field]}
                                        </a>
                                    </td>
                                );
                            }

                            else if (colName === "Заявитель") {
                                const user_full_name = pageData["Пользователь"]?.[item["user_id"]];
                                const name = user_full_name?.split(" ").slice(0, 2).join(" ") || "";
                                return (
                                    <td key={i + colName}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onShowUser(item["user_id"]); }}>
                                            {name}
                                        </a>
                                    </td>
                                );
                            }

                            else if (colName === "Статус") {
                                let status = "";
                                const statusOptions = pageData?.[colName] || { 0: "Неактивный", 1: "Активный" };
                                status = statusOptions[item[field]];
                                if (status === "Закрыто") hideRow = true;
                                return <td key={i + colName}>{status}</td>;
                            }

                            else if (colName.toLowerCase().includes("дата") || colName.toLowerCase().includes("срок")) {
                                const val = item[field];
                                if (val) {
                                    const date = new Date(val);
                                    const formatted = val.includes("T")
                                        ? date.toLocaleString("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                                        : date.toLocaleDateString("ru-RU");
                                    return <td key={i + colName}>{formatted}</td>;
                                }
                                return <td key={i + colName}></td>;
                            }

                            else if (field?.includes("_id")) {
                                if (field === "user_id") {
                                    const user = pageData["user"]?.[item[field]];
                                    const name = user?.fio?.split(" ").slice(0, 2).join(" ") || "";
                                    return <td key={i + colName}>{name}</td>;
                                }
                                else if (colName in pageData) {
                                    return <td key={i + colName}>{pageData[colName]?.[item[field]] || ""}</td>;
                                }
                            }
                            else if (colName === "Открыто" || colName === "Закрыто") {
                                main_page_sums[colName] += item[field] || 0;
                            }
                            else if (colName === "Всего") {
                                const sum = (data[i]["Открыто"] || 0) + (data[i]["Закрыто"] || 0);
                                main_page_sums["total"] += sum || 0;
                                return <td key={i + colName}>{sum}</td>;
                            }

                            return <td key={i + colName}>{item[field] || ""}</td>;
                        });

                        return (
                            <tr key={i} style={{ display: hideRow ? "none" : "table-row" }} row-id={item.id}>
                                {main_page && <td></td>}
                                {tds}
                            </tr>
                        );
                    })}

                    {main_page &&
                        <tr>
                            {<td>Всего</td>}
                            {Object.keys(columns).map((col) => (
                                <td>
                                    {(col === "Открыто" || col === "Закрыто") &&
                                        main_page_sums[col]
                                    }
                                    {(col === "Всего") && main_page_sums["total"]}
                                </td>
                            ))}
                        </tr>
                    }

                </tbody>
            </table>
        </div>
    );
}
