import { DateTime } from "luxon";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DEPENDANT_FIELDS, TABLE_PAGES_CONFIG } from "../../lib/pages";
import OrderHistory from "./OrderHistory";


const onEmailChange = (e => {
    const email = e.target.value;
    const loginField = document.querySelector('input[name="login"]');
    loginField.value = email.split("@")[0];
})

function getDefaultValues(itemData = null, config = {}, preloadData = {}) {
    const defaults = {};

    if (itemData) {
        for (const key in config) {
            if (itemData[key] !== undefined) {
                if (config[key].type === "multiselect") {
                    defaults[key] = itemData[key].map(String);
                } else if (itemData[key] && (config[key].type === "date" || config[key].type === "datetime-local")) {
                    console.log("dynmc form itemData[key]:", itemData[key]);

                    // parse ISO string, convert to local timezone
                    const dt = DateTime.fromISO(itemData[key]).setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);

                    console.log("dynmc form DateTime (local):", dt.toString());

                    // format as YYYY-MM-DDTHH:MM for datetime-local input
                    let formatted = dt.toFormat("yyyy-MM-dd'T'HH:mm");
                    if (!itemData[key].includes("T")) formatted = formatted.slice(0, 10);
                    console.log("dynmc form formatted:", formatted);
                    defaults[key] = formatted;
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
                id => preloadData["Статус"][id].name === "Активен"
                    || preloadData["Статус"][id].name === "Открыто"
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


export default function DynamicForm({ config, preloadData, onSubmit, onClose, itemData = null, show_history = false }) {
    const [dynamicOptions, setDynamicOptions] = useState({});
    const [, setTriggeredFields] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    // deep copy of preloadData
    const preloadOG = JSON.parse(JSON.stringify(preloadData));
    console.log("perms from dynmc form:", permissions);

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
        } finally {
            setIsSubmitting(false);
        }
    };

    function onOptionChange(fieldName) {
        const origin_select = document.querySelector(`select[name="${fieldName}"]`);
        if (!origin_select) return;
        const origin_val = origin_select.value;

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

    let disabled_fields = [];
    if (!permissions.includes("order:create"))
        disabled_fields = [...disabled_fields, "Департамент", "Наименование заявки"];
    if (!permissions.includes("order:delegate")){
        const allowed_fields = ["Статус", "Вложение", "Комментарий"];
        disabled_fields = Object.values(config).filter(field => !allowed_fields.includes(field.label)).map(field => field.label);
    }
    if ((!permissions.includes("order:reopen") || !permissions.includes("superuser")) && itemData && itemData.status_id) {
        const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
        const status_name = preloadData?.[status_field_key]?.[itemData.status_id]?.name;
        if (status_name === "Закрыто")
            disabled_fields = Object.values(config).map(field => field.label);
    }
    // const uneditable_fields = [];

    const form_content = 
            Object.entries(config).map(([fieldName, field]) => {
            let hide = false;
            // don't show these fields for admins (who can create orders)
            if ((field.label === "Исполнитель" || field.label === "Срок") && permissions.includes("order:create")) {
                return;
            }
            // users cant edit these fields
            if (disabled_fields.includes(field.label)) {
                hide = true;
                // if (!itemData) return;
                // let value = itemData[fieldName];
                // if (fieldName.endsWith("_id"))
                //     value = preloadData?.[field.label]?.[value]?.name || value;
                // if (value) {
                //     const uneditable_field = 
                //         <div style={{width: "100%"}}>
                //             <p>{field.label}: {value}</p>
                //         </div>;
                //     uneditable_fields.push(uneditable_field);
                // }
            }

            let preload_title = field.label || fieldName;
            if (preload_title === "Исполнитель" || preload_title === "Заявитель")
                preload_title = "Пользователь";
            preloadData = {...preloadOG}
            
            if (field.type == "select" && fieldName === "status_id") {
                // remove unnecessary statuses
                const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
                if (preloadData[status_field_key]) {
                    preloadData[status_field_key] = Object.fromEntries(
                        Object.entries(preloadData[status_field_key]).filter(([, item]) => item.type === 1)
                    );
                    const delete_status = (status_name, curr_status_id) => {
                        if (!(permissions.includes("order:reopen") || permissions.includes("superuser"))) {
                            console.log("status name:", status_name, "curr status id:", curr_status_id);
                            const StatusIndex = Object.keys(preloadData[status_field_key]).find(key => preloadData[status_field_key][key].name === status_name);
                            console.log("status index:", StatusIndex);
                            if (StatusIndex !== -1 && StatusIndex !== `${curr_status_id}`) {
                                console.log("deleting:", preloadData[status_field_key][`${StatusIndex}`]);
                                delete preloadData[status_field_key][`${StatusIndex}`];
                            }
                            else console.log("aint found no shii");
                        }
                    };
                    if (!itemData || !permissions.includes("order:reopen")) {
                        delete_status("Закрыто", `${itemData["status_id"]}`);
                        delete_status("Открыто", `${itemData["status_id"]}`);
                    }
                }
            }
            
            const preloadOptions = dynamicOptions[fieldName] || preloadData?.[preload_title] || {};
            if (field.type === "select") {
                return (
                    <div key={fieldName} className="edit-form-field">
                        <label>{field.label}</label>
                        <select
                            disabled={hide}
                            {...register(fieldName, getValidationRules(field))}
                            onChange={(e) => {onOptionChange(fieldName); setValue(fieldName, e.target.value, { shouldValidate: true });}}
                        >
                            <option value="">
                                Выберите {field.label.toLowerCase()}
                            </option>
                            {Object.entries(preloadOptions).map(([id, name]) => (
                                <option key={id} value={id}>
                                    {name["name"]}
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
                const options = preloadData?.[field.label] || {};
                return (
                    <div key={fieldName} className="edit-form-field">
                        <label>{field.label}</label>
                        <div className="checkbox-container">
                            {Object.entries(options).map(([val, label]) => (
                                <label key={val} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        value={val}
                                        {...register(fieldName, getValidationRules(field))}
                                        defaultChecked={itemData?.[fieldName]?.includes(Number(val))}
                                        disabled={hide}
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

            if (field.type === "file" || field.type === "file_list") {
                return (
                    <div key={fieldName} className="edit-form-field">
                        <label>{field.label}</label>
                        <input
                            disabled={hide}
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
                <div key={fieldName} className="edit-form-field">
                    <label>{field.label}</label>
                    {field.type === "textarea" ? (
                        <textarea
                            disabled={hide}
                            {...register(fieldName, getValidationRules(field))}
                            rows={4}
                        />
                    ) : (
                        <input
                            type={field.type || "text"}
                            {...register(fieldName, getValidationRules(field))}
                            onChange={(fieldName === "email" || null) && onEmailChange}
                            disabled={fieldName === "login" || hide}
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
            {/* {uneditable_fields} */}
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

                <p>{itemData ? "Редактирование" : "Создание"}</p>
                {form_element}

            </div>

            {show_history && itemData && <OrderHistory orderId={itemData.id} data={itemData} status_preload={preloadData?.[TABLE_PAGES_CONFIG["status"].singular]}/>}

        </div>
    );
}
