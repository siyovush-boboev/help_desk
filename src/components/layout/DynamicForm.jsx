import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { DEPENDANT_FIELDS, TABLE_PAGES_CONFIG } from "../../lib/pages";
import OrderHistory from "./OrderHistory";
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";
import { OrderIcon } from "../ui/icons";


const onEmailChange = (e => {
    const email = e.target.value;
    const loginField = document.querySelector('input[name="login"]');
    loginField.value = email.split("@")[0];
})

function getDefaultValues(itemData = null, config = {}, preloadData = {}) {
    const defaults = {};
    // console.log("itemData in getDefaultValues:", itemData);

    if (itemData) {
        for (let key in config) {
            if (itemData[key] !== undefined || itemData[key.replace("executor_id", "executor")] !== undefined) {
                if (config[key].type === "multiselect") {
                    defaults[key] = itemData[key].map(String);
                } else if (itemData[key] && (config[key].type === "date" || config[key].type === "datetime-local")) {
                    let formatted = itemData[key];
                    if (itemData[key].includes("T"))
                        formatted = itemData[key].slice(0, itemData[key].indexOf("T") + 6);
                    defaults[key] = formatted;
                } else if (key === "executor_id"){
                    defaults[key] = itemData[key.replace("_id", "")]?.id;
                } else {
                    defaults[key] = itemData[key];
                }
                if (key === "email")
                    defaults["login"] = itemData[key].split("@")[0];
            }
        }
    } else {
        if ("status_id" in config) {
            const default_status_id = Object.keys(preloadData["Статус"]).find(
                id => preloadData["Статус"][id].name.startsWith("Актив")
                    || preloadData["Статус"][id].name.startsWith("Открыт")
            );
            defaults["status_id"] = default_status_id;
        }
    }

    return defaults;
}

const getValidationRules = (field) => {
    const rules = {};
    if (field.required) rules.required = `"${field.label}" обязательно для заполнения`;

    if (field.label === "Телефон") {
        rules.pattern = {
            value: /^\+?[0-9\s()-]{5,18}$/,
            message: "Неправильный формат телефона",
        };
    }

    if (field.type === "text") {
        rules.minLength = { value: field?.min || 1, message: `Слишком мало символов` };
        rules.maxLength = { value: field?.max || 255, message: `Слишком много символов (255)` };
    }
    else if (field.type === "number") {
        rules.min = { value: 0, message: `Это число не может быть отрицательным` };
        rules.max = { value: 2 ** 32 - 1, message: `Слишком большое  число` };
        rules.valueAsNumber = true;
    }
    else if (field.type === "email") {
        rules.pattern = {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "Неправильный формат email",
        };
    }
    else if (field.type === "date" || field.type === "datetime-local") {
        rules.validate = {
            isValidDate: (value) => {
                if (!value) return true; // allow empty if not required
                const date = new Date(value);
                return !isNaN(date.getTime()) || `Некорректная дата`;
            },
        };
    }
    else if (field.type === "multiselect") {
        rules.validate = { notEmpty: (val) => val?.length > 0 || `Выберите хотя бы один вариант для ${field.label.toLowerCase()}`, };
    }

    return rules;
};

function getDisabledFields(itemData, config, preloadData, permissions) {
    const role = localStorage.getItem("user_role")?.replace(/"/g, "");
    let new_disabled_fields = [];

    if (role === "superuser") {
        return [];
    }
    else if (itemData){
        const allowed_fields = ["Статус", "Вложение", "Описание"];
        if (Object.keys(itemData["executor"]).length === 0 || role === "user")
            allowed_fields.push("Исполнитель");
        if (itemData["duration"] === null)
            allowed_fields.push("Срок");
        if(!itemData["otdel_id"])
            allowed_fields.push("Отдел");
        if(!itemData["priority_id"])
            allowed_fields.push("Приоритет");
        new_disabled_fields = Object.values(config).filter(field => !allowed_fields.includes(field.label)).map(field => field.label);
    }
    else if (role === "admin" || (role === "user" && !itemData)) {
        new_disabled_fields = ["Отдел", "Приоритет"];
        if (!permissions.includes("order:delegate") || role === "user") {
            new_disabled_fields = [...new_disabled_fields, "Срок", "Исполнитель"];
        }
    }
    else if (role === "user") {
        if (itemData["creator"]["id"] !== Number(localStorage.getItem("user_id").replace(/"/g, ""))) {
            new_disabled_fields = ["Наименование заявки", "Департамент", "Филиал", "Офис ЦБО", "Адрес", "Оборудование"];
        }
        if (!itemData["executor"]) {
            new_disabled_fields = [...new_disabled_fields, "Статус"];
        }
    }
    // else if (role === "executor") {
    //     const allowed_fields = ["Статус", "Вложение", "Описание"];
    //     new_disabled_fields = Object.values(config).filter(field => !allowed_fields.includes(field.label)).map(field => field.label);
    // }

    if (itemData && itemData.status_id) {
        const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
        const status_name = preloadData?.[status_field_key]?.[itemData.status_id]?.name;
        if (status_name === "Закрыто")
            new_disabled_fields = Object.values(config).map(field => field.label);
    }
    return new_disabled_fields;
}

export default function DynamicForm({ config, preloadData, onSubmit, onClose, itemData = null, show_history = false, page_name=null }) {
    const [dynamicOptions, setDynamicOptions] = useState({});
    const [, setTriggeredFields] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const permissions = useMemo(() => JSON.parse(localStorage.getItem("permissions")) || [], []);
    const [firstComment, setFirstComment] = useState(" ");
    const [history, setHistory] = useState(["loading msg"]);
    const [disabled_fields, setDisabledFields] = useState([]);
    const [err, setErr] = useState("");

    // deep copy of preloadData
    const preloadOG = JSON.parse(JSON.stringify(preloadData));

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/${TABLE_PAGES_CONFIG["order"]["resource"]}/${itemData.id}/history`
                );
                const history = res.data?.body || [];
                setHistory(history)
                if (history.length > 0) {
                    setFirstComment(history[0]?.comment || "");
                }
            } catch (err) {
                console.error("Error loading history:", err);
                setHistory("error msg");
            }
        };

        if (itemData?.id && page_name === "order") {
            fetchHistory();
        }
    }, [itemData?.id, page_name]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: getDefaultValues(itemData, config, preloadData),
        mode: "onChange",
    });

    const handleFormSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            await onSubmit(data); // call the real submit fn
        } catch (err) {
            console.error("Submit error:", err);
            setErr(err?.response.data.message || "Ошибка при отправке формы");
        } finally {
            setIsSubmitting(false);
        }
    };

    function onOptionChange(fieldName) {
        const origin_select = document.querySelector(`select[name="${fieldName}"]`);
        if (!origin_select) return;
        const origin_val = origin_select.value;

        if (fieldName === "equipment_id" && page_name === "order") {
            // find a field with label "Адрес" and fill it with the address of the selected equipment
            const addressFieldName = Object.entries(config).find(([, field]) => field.label === "Адрес")?.[0];
            if (addressFieldName) {
                const origin_id = Number(origin_val);
                const address = preloadData["Оборудование"]?.[origin_id]?.address || "";
                setValue(addressFieldName, address);
            }
        }

        if (fieldName === "department_id" && page_name === "order" && permissions.includes("scope:department")) {
            const user_department_id = localStorage.getItem("user_department_id");
            if (origin_val === user_department_id) {
                setDisabledFields(() => []);
            }
            else {
                const new_disabled_fields = getDisabledFields(itemData, config, preloadData, permissions);
                // return the previous (or empty) values for these fields
                Object.entries(config).forEach(([fieldName, field]) => {
                    if (new_disabled_fields.includes(field.label)) {
                        setValue(fieldName, itemData?.[fieldName] || "");
                    }
                });
                setDisabledFields(new_disabled_fields);
            }
        }

        // If empty string (reset trigger)
        if (origin_val === "") {
            if (DEPENDANT_FIELDS.desc[fieldName]) {
                DEPENDANT_FIELDS.desc[fieldName].forEach(dependentField => {
                    const dependentLabel = config[dependentField]?.label || dependentField;
                    const rawOptions = preloadData[dependentLabel] || {};

                    // restore full options
                    setDynamicOptions(prev => ({ ...prev, [dependentField]: rawOptions }));

                    // also clear value if u want
                    setValue(dependentField, "");

                    // recursively reset all downstream deps too
                    if (DEPENDANT_FIELDS.desc[dependentField]) onOptionChange(dependentField);
                });
            }
            return; // exit early, don’t do the filtering stuff
        }

        const origin_id = Number(origin_val);
        setTriggeredFields(prev => new Set(prev.add(fieldName)));

        const asc = (fieldName) => {
            DEPENDANT_FIELDS.asc[fieldName].forEach(dependentField => {
                const origin_label = origin_select.previousSibling.textContent.trim();
                const option_to_select_id = preloadData[origin_label][origin_id]?.[dependentField];
                const dependentSelect = document.querySelector(`select[name="${dependentField}"]`);
                if (dependentSelect) {
                    setValue(dependentField, option_to_select_id);
                    if (DEPENDANT_FIELDS.asc[dependentField])
                        asc(dependentField);
                }
            });
        };

        const desc = (fieldName) => {
            DEPENDANT_FIELDS.desc[fieldName].forEach(dependentField => {
                let dependentLabel = config[dependentField]?.label || dependentField;
                if (dependentLabel === "Заявитель" || dependentLabel === "Исполнитель")
                    dependentLabel = "Пользователь";
                const rawOptions = preloadData[dependentLabel] || {};
                const filtered = Object.fromEntries(
                    Object.entries(rawOptions).filter(([, val]) => val[fieldName] === origin_id)
                );
                setDynamicOptions(prev => ({ ...prev, [dependentField]: filtered }));
                // const firstOptionId = Object.keys(filtered)[0];
                // if (firstOptionId)
                //     setValue(dependentField, Number(firstOptionId));
                if (DEPENDANT_FIELDS.desc[dependentField])
                    desc(dependentField);
            });
        };

        if (DEPENDANT_FIELDS.asc[fieldName]) asc(fieldName);
        if (DEPENDANT_FIELDS.desc[fieldName]) desc(fieldName);
    }

    useEffect(() => {
        if (itemData) {
            // go thru all fields that got dependants in DESC and manually trigger the filters
            Object.keys(DEPENDANT_FIELDS.desc).forEach(fieldName => {
                if (itemData[fieldName] !== undefined)
                    onOptionChange(fieldName);
            });
        }
    }, []);

    useEffect(() => {
        if (page_name === "order" || page_name === "main") {
            const new_disabled_fields = getDisabledFields(itemData, config, preloadData, permissions);
            setDisabledFields(new_disabled_fields);
        }
    }, [page_name, itemData, permissions, config, preloadData]);

    const form_content = 
            Object.entries(config).map(([fieldName, field]) => {
            // let hide = false;
            // // users cant edit these fields
            // if (disabled_fields.includes(field.label)) {
            //     hide = true;
            // }

            let preload_title = field.label || fieldName;
            if (preload_title === "Исполнитель" || preload_title === "Заявитель")
                preload_title = "Пользователь";
            preloadData = {...preloadOG};

            if (field.type === "select" && fieldName === "status_id" && (page_name === "order" || page_name === "main")) {
                const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
                const statuses = preloadData[status_field_key];
                if (!statuses) return;

                const role = localStorage.getItem("user_role")?.replace(/"/g, "").toLowerCase();
                // const isAdmin = admin_roles.includes(role);
                const isSuper = role === "superuser";
                const currStatusId = `${itemData?.["status_id"] || ""}`;
                const currStatus = preloadData[status_field_key]?.[currStatusId] || {};

                // divide statuses into these:
                const openStatuses = {};
                const closedStatuses = {};
                const type1Statuses = {};
                const type3Statuses = {};
                const currStatuses = {};
                const otherStatuses = {};
                if ( Object.keys(currStatus).length !== 0)
                    currStatuses[currStatusId] = currStatus;

                Object.entries(statuses).forEach(([id, item]) => {
                    if (item.name === "Открыто") {
                        openStatuses[id] = item;
                    } else if (item.name === "Закрыто") {
                        closedStatuses[id] = item;
                    } else if (item.type === 1) {
                        type1Statuses[id] = item;
                    } else if (item.type === 3) {
                        type3Statuses[id] = item;
                    } else {
                        otherStatuses[id] = item;
                    }
                });

                preloadData[status_field_key] = {...currStatuses, ...otherStatuses};
                if (isSuper){
                    preloadData[status_field_key] = {...preloadData[status_field_key], ...openStatuses, };
                    if (itemData)
                        preloadData[status_field_key] = {...preloadData[status_field_key], ...type1Statuses, ...closedStatuses, ...type3Statuses, };
                }
                // if user is creator of the order
                else if ((!itemData) || (itemData && itemData["creator"]["id"] === Number(localStorage.getItem("user_id").replace(/"/g, "")))){
                    preloadData[status_field_key] = {...preloadData[status_field_key], ...openStatuses, };
                    if (itemData)
                        preloadData[status_field_key] = {...preloadData[status_field_key], ...closedStatuses, ...type3Statuses, };
                }
                else if (permissions.includes("scope:all")) {
                    preloadData[status_field_key] = {...preloadData[status_field_key], ...openStatuses, ...closedStatuses, ...type3Statuses, };
                }
                // user (dep head)
                else if (permissions.includes("order:update") && permissions.includes("order:delegate")) {
                    preloadData[status_field_key] = {...preloadData[status_field_key], ...type3Statuses, };
                }
                // executor
                else if (permissions.includes("order:update")) {
                    preloadData[status_field_key] = {...preloadData[status_field_key], ...type1Statuses, };
                }

                // if (permissions.includes("order:create") || permissions.includes("superuser")) {
                //     preloadData[status_field_key] = {...preloadData[status_field_key], ...openStatuses, };
                // }
                // if (permissions.includes("order:create") || permissions.includes("superuser")) {
                //     preloadData[status_field_key] = {...preloadData[status_field_key], ...closedStatuses, ...type3Statuses, };
                // }
                // if (!(isAdmin || isSuper)) {
                //     preloadData[status_field_key] = {...preloadData[status_field_key], ...type1Statuses, };
                // }
            }
            const preloadOptions = dynamicOptions[fieldName] || preloadData?.[preload_title] || {};
            if (field.type === "select") {
                return (
                    <div key={fieldName} className="edit-form-field" style={field.width ? {width: `calc(${field.width} - 14px)`} : {}}>
                        <label>{field.label}</label>
                        <select
                            disabled={disabled_fields.includes(field.label)}
                            {...register(fieldName, getValidationRules(field))}
                            onChange={(e) => {onOptionChange(fieldName); setValue(fieldName, e.target.value, { shouldValidate: true });}}
                        >
                            <option value="">
                                Выберите {field.label.toLowerCase()}
                            </option>
                            {Object.entries(preloadOptions).map(([id, name]) => (
                                <option key={id} value={id}>
                                    {["Роль", "Привелигия"].includes(field.label) ? name["description"] : name["name"]}
                                </option>
                            ))}
                        </select>
                        {errors[fieldName] && (
                            <p>{errors[fieldName].message}</p>
                        )}
                    </div>
                );
            }

            if (field.type === "multiselect") {
                let options = preloadData?.[field.label] || {};
                if (field.label === "Привелигия"){
                    const others = {}, create = {}, read = {}, update = {}, delete_ = {};
                    Object.entries(options).forEach(([id, item]) => {
                        if (item.name.endsWith(":create")) create[id] = item;
                        else if (item.name.endsWith(":read")) read[id] = item;
                        else if (item.name.endsWith(":update")) update[id] = item;
                        else if (item.name.endsWith(":delete")) delete_[id] = item;
                        else others[id] = item;
                    });
                    const ordered_options = {1: others, 2: create, 3: read, 4: update, 5: delete_};
                    return (
                        <div key={fieldName} className="edit-form-field" style={field.width ? {width: `calc(${field.width} - 14px)`} : {}}>
                            <label>{field.label}</label>
                            <div className="checkbox-container">
                                {Object.entries(ordered_options).map(([, options_list]) => (
                                    Object.entries(options_list).map(([val, label]) => (
                                        <label key={val} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                value={val}
                                                {...register(fieldName, getValidationRules(field))}
                                                defaultChecked={itemData?.[fieldName]?.includes(Number(val))}
                                                disabled={disabled_fields.includes(field.label)}
                                            />
                                            <span>{label["description"]}</span>
                                        </label>
                                    ))
                                ))}
                            </div>
                            {errors[fieldName] && (
                                <p>{errors[fieldName].message}</p>
                            )}
                        </div>
                    );
                } else {
                    return (
                        <div key={fieldName} className="edit-form-field" style={field.width ? {width: `calc(${field.width} - 14px)`} : {}}>
                            <label>{field.label}</label>
                            <div className="checkbox-container">
                                {Object.entries(options).map(([val, label]) => (
                                    <label key={val} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            value={val}
                                            {...register(fieldName, getValidationRules(field))}
                                            defaultChecked={itemData?.[fieldName]?.includes(Number(val))}
                                            disabled={disabled_fields.includes(field.label)}
                                        />
                                        <span>{label["name"]}</span>
                                    </label>
                                ))}
                            </div>
                            {errors[fieldName] && (
                                <p>{errors[fieldName].message}</p>
                            )}
                        </div>
                    );
                }
            }

            if (field.type === "file" || field.type === "file_list") {
                return (
                    <div key={fieldName} className="edit-form-field" style={field.width ? {width: `calc(${field.width} - 14px)`} : {}}>
                        <label>{field.label}</label>
                        <input
                            disabled={disabled_fields.includes(field.label)}
                            type="file"
                            {...register(fieldName, getValidationRules(field))}
                            multiple={field.type === "file_list"}
                        />
                        {errors[fieldName] && (
                            <p>{errors[fieldName].message}</p>
                        )}
                    </div>
                );
            }

            return (
                <div key={fieldName} className="edit-form-field" style={field.width ? {width: `calc(${field.width} - 14px)`} : {}}>
                    <label>{field.label}</label>
                    {field.type === "textarea" ? (
                        <textarea
                            disabled={disabled_fields.includes(field.label)}
                            {...register(fieldName, getValidationRules(field))}
                            rows={4}
                        />
                    ) : (
                        <input
                            type={field.type || "text"}
                            {...register(fieldName, getValidationRules(field))}
                            onChange={(fieldName === "email" || null) && onEmailChange}
                            disabled={fieldName === "login" || disabled_fields.includes(field.label)}
                        />
                    )}
                    {errors[fieldName] && (
                        <p>{errors[fieldName].message}</p>
                    )}
                </div>
            );
        })

    const form_element = 
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate id="editForm">
            {form_content}
            <div className="modal-buttons">
                <button id="confirmBtn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Загрузка..." : "Сохранить"}
                </button>
                <button id="cancelBtn" onClick={onClose}>Отмена</button>
            </div>
        </form>;

    return (
        <div className="form-container">
            <div>
                <p><OrderIcon />{TABLE_PAGES_CONFIG[page_name]["singular"]}</p>
                {firstComment !== " " &&
                    <div className="first-comment">
                        <p>Описание:</p>
                        <p>{firstComment}</p>
                        <hr style={{color: "white"}}></hr>
                    </div>
                }
                {form_element}
                <div className="error-message">{err && <p>{err}</p>}</div>
            </div>
            {show_history && itemData && <OrderHistory history={history} data={itemData} status_preload={preloadData?.[TABLE_PAGES_CONFIG["status"].singular]}/>}
        </div>
    );
}
