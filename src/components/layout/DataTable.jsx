import { DeleteTableRowIcon, EditTableRowIcon, CollectionBlueIcon } from "../ui/icons.jsx";
import { BASE_URL } from "../../lib/constants.js";
import { priority_colors } from "../../lib/constants.js";

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
    onSort = () => { },
    main_page = false,
    showClosed = false,
    showEdit = false,
    showDelete = false,
    showPermissionsEdit = false,
    onPermissionsEdit = () => { },
}) {
    const main_page_sums = { "Открыто": 0, "Закрыто": 0, "total": 0 };

    if ("pagination" in data)
        data = data["list"]

    const banned_cols_for_sorting = ["CHECKMARK", "№", "Действия", "Иконка", "Отдел", "Должность"];

    const onHeaderClick = (e) => {
        const up = "▲", down = "▼";
        const th = e.target;
        const colName = th.innerText;

        if (!colName || banned_cols_for_sorting.includes(colName)) return;

        if (colName.includes(up) || colName.includes(down)) {
            const isAsc = colName.includes(up);
            th.innerText = colName.slice(0, colName.length - 1) + (isAsc ? down : up);
            onSort(columns[colName.slice(0, colName.length - 1)], isAsc ? "desc" : "asc");
        } else {
            onSort(columns[colName], "asc");
            th.innerText = colName + up;
        }
    };
    // for handling sorting arrows properly
    const searchParams = Object.fromEntries(new URLSearchParams(window.location.search));
    let hidden_rows_count = 0;

    return (
        <div className="table-wrapper">
            <table className="custom-table">

                <thead>
                    <tr>
                        {main_page && <th>-</th>}
                        {Object.keys(columns).map((col) => {
                            if (col === "CHECKMARK") {
                                if (!showDelete) return;
                                return <th key={col}><SelectAllCheckbox /></th>
                            };
                            if (col === "Действия" && !showEdit && !showDelete) {
                                return;
                            }
                            if (main_page) {
                                return <th key={col}>{col}</th>;
                            }
                            // find the column that is currently being sorted
                            let direction = null;
                            if (searchParams[`sort[${columns[col]}]`]) {
                                direction = searchParams[`sort[${columns[col]}]`];
                            }
                            return <th key={col} onClick={onHeaderClick} title="Нажмите чтобы отсортировать" style={banned_cols_for_sorting.includes(col) ? {} : { cursor: "pointer" }}>{col}{direction && (direction === "ASC" ? "▲" : "▼")}</th>
                        })}
                    </tr>
                </thead>

                <tbody>
                    {data.map((item, i) => {
                        let hideRow = false;
                        let make_red = false;
                        let make_green = false;

                        const tds = Object.entries(columns).map(([colName, field]) => {
                            if (colName === "Статус") {
                                const status_id = `${item[field]}`;
                                const status = pageData[colName]?.[status_id];
                                if (status?.name === "Закрыто") {
                                    hideRow = !showClosed;
                                    hidden_rows_count += !showClosed;
                                    make_green = true;
                                }
                                const icon = <img src={BASE_URL + status?.["icon_small"]} alt="" className="status-icon" />;
                                return <td key={i + colName}>
                                    <div className="status-cell">{icon} {status?.name || ""}</div>
                                </td>;
                            }
                            else if (colName === "Иконка") {
                                const icon = item[field] ? <img src={BASE_URL + item[field]} alt="" /> : "Нет иконки";
                                return <td key={i + colName}><div className="status-cell">{icon}</div></td>;
                            }
                            else if (colName === "CHECKMARK") {
                                if (!showDelete) return;
                                return <td key={i + colName}><input type="checkbox" /></td>;
                            }
                            else if (colName === "Действия") {
                                if (showEdit || showDelete)
                                    return (
                                        <td key={i + colName}>
                                            <div className="table-actions">
                                                {showDelete && <button id="table-delete-button" onClick={() => onDelete(item.id)} aria-label="table-delete-button" title="Удалить"><DeleteTableRowIcon /></button>}
                                                {showEdit && <button id="table-edit-button" onClick={() => onEdit(item.id)} aria-label="table-edit-button" title="Изменить данные"><EditTableRowIcon /></button>}
                                                {showPermissionsEdit && <button id="table-edit-button" onClick={() => onPermissionsEdit(item.id)} aria-label="table-edit-button" title="Редактировать привилегии"><CollectionBlueIcon /></button>}
                                            </div>
                                        </td>
                                    );
                                return;
                            }
                            else if (colName === "Наименование заявки") {
                                return (
                                    <td key={i + colName} onClick={(e) => { e.preventDefault(); onEdit(item.id); }}>
                                        <a href="#">
                                            {item[field]}
                                        </a>
                                    </td>
                                );
                            }
                            else if (colName === "Заявитель" || colName === "Исполнитель") {
                                const user_full_name = item[colName === "Заявитель" ? "creator_name" : "executor_name"];
                                // const name = user_full_name?.split(" ").slice(0, 2).join(" ") || "";
                                const user_id = item[colName === "Заявитель" ? "creator_id" : "executor_id"];
                                return (
                                    <td key={i + colName} onClick={(e) => { e.preventDefault(); onShowUser(user_id); }}>
                                        <a href="#">
                                            {user_full_name}
                                        </a>
                                    </td>
                                );
                            }
                            else if (colName.toLowerCase().includes("дата") || colName.toLowerCase().includes("срок")) {
                                if (colName.toLowerCase().includes("срок") && item["duration"]) {
                                    const due_date = new Date(item["duration"]);
                                    const now = new Date();
                                    if (due_date < now)
                                        make_red = true;
                                }
                                const val = item[field];
                                if (val) {
                                    let formatted = val;
                                    if (val.includes("T"))
                                        formatted = val.slice(0, val.indexOf("T") + 6).replace("T", " ");
                                    formatted = formatted.replace(/-/g, ".");
                                    // reverse date format from YYYY.MM.DD to DD.MM.YYYY
                                    const parts = formatted.split(" ");
                                    const dateParts = parts[0].split(".");
                                    if (dateParts.length === 3) {
                                        const reversedDate = [dateParts[2], dateParts[1], dateParts[0]].join(".");
                                        formatted = reversedDate + (parts[1] ? " " + parts[1] : "");
                                    }
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
                                return <td key={i + colName}>{sum}</td>;
                            } else if ((field?.includes("_id") && (colName in pageData)) || ((field === "type" || field === "position_type_id") && "position_type_id" in pageData)) {
                                if (field === "type") {
                                    colName = "position_type_id";
                                }
                                let field_content = "";
                                if (field === "position_type_id") {
                                    item["position_ids"].forEach(position_id => {
                                        const position_type = pageData["Должность"][position_id]?.["type"];
                                        if (position_type) {
                                            field_content += pageData["position_type_id"][position_type]?.name + " ";
                                        }
                                    });
                                }
                                else if (Array.isArray(item[field]) && item[field].length > 0) {
                                    const role_strings = [];
                                    item[field].forEach(id => { role_strings.push(pageData[colName][id]?.name || ""); });
                                    field_content = role_strings.join(", ");
                                }
                                else if (item[field]) {
                                    field_content = pageData[colName]?.[item[field]]?.name;
                                }
                                else if (field in item || field.replace("_id", "") in item) {
                                    field_content = item[field.replace("_id", "")]?.["name"]
                                }
                                return <td key={i + colName} style={colName === "Приоритет" ? { color: priority_colors[field_content] } : {}}>
                                    {field_content || ""}
                                </td>;
                            }
                            else if (colName === "№") {
                                return <td key={i + colName}>{i + 1 - hidden_rows_count}</td>;
                            }

                            return <td key={i + colName}>{item[field] || ""}</td>;
                        });

                        return (
                            <tr key={i} style={{ display: hideRow ? "none" : "table-row", backgroundColor: make_green ? "rgba(175, 253, 195, 1)" : make_red ? "rgba(255, 184, 184, 1)" : "inherit" }} row-id={item.id}>
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
