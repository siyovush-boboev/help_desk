import { DeleteTableRowIcon, EditTableRowIcon } from "../ui/icons.jsx";
import { BASE_URL } from "../../lib/constants.js";


const handleSelectAll = (e) => {
    const checkboxes = document.querySelectorAll(".custom-table tbody input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = e.target.checked);
};

function SelectAllCheckbox() {
    return (
        <input
            type="checkbox"
            id="select-all"
            title="Выбрать все"
            onChange={handleSelectAll}
        />
    );
}

function MainPageTotal({ columns, main_page_sums }) {
    return (
        <tr>
            {<td>Всего</td>}
            {Object.keys(columns).map((col) => (
                <td key={col}>
                    {(col === "Открыто" || col === "Закрыто") && main_page_sums[col]}
                    {(col === "Всего") && main_page_sums["total"]}
                </td>
            ))}
        </tr>
    );
}


export default function DataTable({
    columns = {},
    data = [],
    pageData = {},
    onEdit = () => { },
    onDelete = () => { },
    onShowUser = () => { },
    main_page = false,
    showClosed = false
}) {
    const main_page_sums = { "Открыто": 0, "Закрыто": 0, "total": 0 };

    if ("pagination" in data)
        data = data["list"]

    const priority_colors = {
        "Низкий": "#22c55e",
        "Средний": "#eab308",
        "Высокий": "#f97316",
        "Критический": "#dc2626",
    };

    return (
        <div className="table-wrapper">
            <table className="custom-table">

                <thead>
                    <tr>
                        {main_page && <th>-</th>}
                        {Object.keys(columns).map((col) => (
                            <th key={col}>{col === "CHECKMARK" ? <SelectAllCheckbox /> : col}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((item, i) => {
                        let hideRow = false;

                        const tds = Object.entries(columns).map(([colName, field]) => {
                            if (colName === "Статус") {
                                const status_id = `${item[field]}`;
                                const status = pageData[colName]?.[status_id];
                                if (status?.name === "Закрыто") hideRow = !showClosed;
                                const icon = <img src={BASE_URL + status?.["icon_big"]} alt="" />;
                                return <td key={i + colName}><div className="status-cell">{icon} {status?.name || ""}</div></td>;
                            }
                            else if (colName === "Иконка") {
                                const icon = item[field] ? <img src={BASE_URL + item[field]} alt="" /> : "Нет иконки";
                                return <td key={i + colName}><div className="status-cell">{icon}</div></td>;
                            }
                            else if (colName === "CHECKMARK") {
                                return <td key={i + colName}><input type="checkbox" /></td>;
                            }
                            else if (colName === "№") {
                                return <td key={i + colName}>{i + 1}</td>;
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
                            else if (colName === "Заявитель" || colName === "Исполнитель") {
                                const user = item[colName === "Заявитель" ? "creator" : "executor"];
                                const user_full_name = user["fio"];
                                const name = user_full_name?.split(" ").slice(0, 2).join(" ") || "";
                                const user_id = user["id"];
                                return (
                                    <td key={i + colName}>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onShowUser(user_id); }}>
                                            {name}
                                        </a>
                                    </td>
                                );
                            }
                            else if (colName.toLowerCase().includes("дата")) {
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
                            else if (colName === "Открыто" || colName === "Закрыто") {
                                main_page_sums[colName] += item[field] || 0;
                            }
                            else if (colName === "Всего") {
                                const sum = (data[i]["open"] || 0) + (data[i]["closed"] || 0);
                                main_page_sums["total"] += sum;
                                console.log("data i:", data[i]);
                                return <td key={i + colName}>{sum}</td>;
                            } else if (field?.includes("_id")) {
                                if (colName in pageData) {
                                    let field_content = ""
                                    if (item[field])
                                        field_content = pageData[colName][item[field]]?.name;
                                    else if (field in item || field.replace("_id", "") in item)
                                        field_content = item[field.replace("_id", "")]?.["name"]
                                    return  <td key={i + colName} style={colName === "Приоритет" ? { color: priority_colors[field_content] } : {}}>
                                                {field_content || ""}
                                            </td>;
                                }
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

                    {main_page && <MainPageTotal columns={columns} main_page_sums={main_page_sums} />}

                </tbody>
            </table>
        </div>
    );
}
