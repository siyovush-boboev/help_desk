import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { DEPENDANT_FIELDS, TABLE_PAGES_CONFIG } from "../../lib/pages";
import { onEmailChange, getDefaultValues, getValidationRules } from "../../lib/utils/helpers";
import { BASE_URL, API_BASE_URL, priority_colors } from "../../lib/constants";
import axios from "../../lib/contexts/axiosInstance";
import OrderHistory from "./OrderHistory";
import { OrderIcon } from "../ui/icons";
import Select from 'react-select';


function getDisabledFields(itemData, config, preloadData, permissions) {
    let new_disabled_fields = [];
    const mode = itemData ? "update" : "create";

    Object.entries(config).forEach(([fieldName, field]) => {
        const label = field.label || fieldName;
        if (!permissions.includes(`order:${mode}:${fieldName}`)){
            new_disabled_fields.push(label);
        }
    });

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
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: getDefaultValues(itemData, config, preloadData),
        mode: "onChange",
    });
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

        const filter_with_all_field_names = (fieldName, dependentField, rawOptions) => {
            const allFieldnames = [fieldName];
            for (const field_name in DEPENDANT_FIELDS.desc){
                if (DEPENDANT_FIELDS.desc[field_name].includes(dependentField) && !allFieldnames.includes(field_name))
                    allFieldnames.push(field_name);
            }
            const filtered = Object.fromEntries(
                Object.entries(rawOptions).filter(([, val]) => {
                    return allFieldnames.every(fname => {
                        // find the select element for this fname and get its current value if its selected
                        const selectElem = document.querySelector(`select[name="${fname}"]`);
                        if (!selectElem) return true;
                        const curr_val = selectElem.value;
                        if (curr_val === "") return true; // if not selected, dont filter by this field                            
                        return val[fname] === Number(curr_val);
                    });
                })
            );
            return filtered;
        };

        // If empty string (reset trigger)
        if (origin_val === "") {
            if (DEPENDANT_FIELDS.desc[fieldName]) {
                DEPENDANT_FIELDS.desc[fieldName].forEach(dependentField => {
                    let dependentLabel = config[dependentField]?.label || dependentField;
                    if (dependentLabel === "Заявитель" || dependentLabel === "Исполнитель")
                        dependentLabel = "Пользователь";
                    const rawOptions = preloadData[dependentLabel] || {};
                    const filtered = filter_with_all_field_names(fieldName, dependentField, rawOptions);

                    // set filtered options
                    setDynamicOptions(prev => ({ ...prev, [dependentField]: filtered }));

                    // also clear value
                    setValue(dependentField, "");

                    // recursively reset all downstream deps too
                    if (DEPENDANT_FIELDS.desc[dependentField]) onOptionChange(dependentField);
                });
            }
            return;
        }

        const origin_id = Number(origin_val);
        setTriggeredFields(prev => new Set(prev.add(fieldName)));

        const asc = (fieldName) => {
            DEPENDANT_FIELDS.asc[fieldName].forEach(dependentField => {
                let origin_label = origin_select.previousSibling.textContent.trim();
                if (origin_label === "Заявитель" || origin_label === "Исполнитель")
                    origin_label = "Пользователь";
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
                const filtered = filter_with_all_field_names(fieldName, dependentField, rawOptions);
                setDynamicOptions(prev => ({ ...prev, [dependentField]: filtered }));
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

            let preload_title = field.label || fieldName;
            if (preload_title === "Исполнитель" || preload_title === "Заявитель")
                preload_title = "Пользователь";
            preloadData = {...preloadOG};

            // go thru all objects in preloadData and if it has status_id and
            // its status name in lowercase starts with "неактив" then remove it
            // Step 1: Get the status group
            const statusKey = TABLE_PAGES_CONFIG["status"].singular.trim();
            const statusGroup = JSON.parse(localStorage.getItem(`preload_status`))["data"] || {};

            // Step 2: Find all status IDs that are "неактив"
            const inactiveStatusIds = Object.entries(statusGroup)
                .filter(([, status]) => status?.name?.toLowerCase()?.startsWith("неактив"))
                .map(([id]) => id); // IDs are strings

            // Step 3: Loop through preloadData and remove items with those statuses
            Object.entries(preloadData).forEach(([key, items]) => {
                if (key === statusKey) return; // Skip the status group itself

                Object.entries(items).forEach(([id, item]) => {
                    const itemStatusId = String(item.status_id); // Ensure string for comparison

                    if (inactiveStatusIds.includes(itemStatusId)) {
                        delete preloadData[key][id];
                    }
                });
            });

            if (field.type === "select" && fieldName === "status_id" && (page_name === "order" || page_name === "main")) {
                const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
                const statuses = preloadData[status_field_key];
                if (!statuses) return;

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
                if ((!itemData) || (itemData && itemData["creator"]["id"] === Number(localStorage.getItem("user_id").replace(/"/g, "")))){
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
                                <option key={id} value={id} style={field.label === "Приоритет" ? { color: priority_colors[name["name"]] || 'inherit' } : {}}>
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
                    const others = {}, create = {}, read = {}, update = {}, delete_ = {},
                          scope = {}, order_create = {}, order_update = {};
                    Object.entries(options).forEach(([id, item]) => {
                        if (item.name.endsWith(":create")) create[id] = item;
                        else if (item.name.endsWith(":read")) read[id] = item;
                        else if (item.name.endsWith(":update")) update[id] = item;
                        else if (item.name.endsWith(":delete")) delete_[id] = item;
                        else if (item.name.startsWith("scope:")) scope[id] = item;
                        else if (item.name.startsWith("order:create")) order_create[id] = item;
                        else if (item.name.startsWith("order:update")) order_update[id] = item;
                        else others[id] = item;
                    });
                    const ordered_options = {1: others, 2: create, 3: read, 4: update, 5: delete_, 6: scope, 7: order_create, 8: order_update};
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

            if (field.type === "checkbox") {
                return (
                    <div key={fieldName} className="edit-form-field" style={field.width ? {width: `calc(${field.width} - 14px)`} : {}}>
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                {...register(fieldName, getValidationRules(field))}
                                defaultChecked={itemData?.[fieldName] || false}
                                disabled={disabled_fields.includes(field.label)}
                            />
                            <span>{field.label}</span>
                            </label>
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
