import { useState } from "react";
import { useForm } from "react-hook-form";
import { DEPENDANT_FIELDS } from "../../lib/pages";

const onEmailChange = (e => {
    const email = e.target.value;
    const loginField = document.querySelector('input[name="login"]');
    loginField.value = email.split("@")[0];
})

export default function DynamicForm({ config, preloadData, onSubmit, onClose, itemData = null }) {
    const [dynamicOptions, setDynamicOptions] = useState({});
    const [, setTriggeredFields] = useState(new Set());

    if (!("Статус" in preloadData))
        preloadData["Статус"] = { "1": { name: "Активен" }, "0": { name: "Неактивен" } };

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({ defaultValues: getDefaultValues() });

    function getDefaultValues() {
        const defaults = {};

        if (itemData) {
            for (const key in config) {
                if (itemData[key] !== undefined) {
                    if (config[key].type === "multiselect") {
                        defaults[key] = itemData[key].map(String);
                    } else if (config[key].type === "datetime-local") {
                        defaults[key] = itemData[key]?.slice(0, 16);
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

    function onOptionChange(fieldName) {
        const origin_select = document.querySelector(`select[name="${fieldName}"]`);
        const origin_id = Number(origin_select.value);

        setTriggeredFields(prev => new Set(prev.add(fieldName)));

        if (DEPENDANT_FIELDS.asc[fieldName]) {
            DEPENDANT_FIELDS.asc[fieldName].forEach(dependentField => {
                const origin_label = origin_select.previousSibling.textContent.trim();
                const option_to_select_id = preloadData[origin_label][origin_id]?.[dependentField];
                const dependentSelect = document.querySelector(`select[name="${dependentField}"]`);
                if (dependentSelect) {
                    setValue(dependentField, option_to_select_id, { shouldValidate: true });
                    if (DEPENDANT_FIELDS.asc[dependentField]) {
                        onOptionChange(dependentField);
                    }
                }
            });
        }

        if (DEPENDANT_FIELDS.desc[fieldName]) {
            DEPENDANT_FIELDS.desc[fieldName].forEach(dependentField => {
                const dependentLabel = config[dependentField]?.label || dependentField;
                const rawOptions = preloadData[dependentLabel] || {};
                const filtered = Object.fromEntries(
                    Object.entries(rawOptions).filter(([, val]) => val[fieldName] === origin_id)
                );

                setDynamicOptions(prev => ({
                    ...prev,
                    [dependentField]: filtered
                }));

                const firstOptionId = Object.keys(filtered)[0];
                if (firstOptionId) {
                    setValue(dependentField, firstOptionId, { shouldValidate: true });
                }

                if (DEPENDANT_FIELDS.desc[dependentField]) {
                    onOptionChange(dependentField);
                }
            });
        }
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
            rules.minLength = { value: 1, message: `Слишком мало символов` };
            rules.maxLength = { value: 255, message: `Слишком много символов (255)` };
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

    return (
        <div className="modal-content">
            <p>{itemData ? "Редактирование" : "Создание"}</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate id="editForm">
                {Object.entries(config).map(([fieldName, field]) => {
                    let preload_title = field.label || fieldName;
                    if (preload_title === "Исполнитель" || preload_title === "Заявитель")
                        preload_title = "Пользователь";
                    const preloadOptions = dynamicOptions[fieldName] || preloadData?.[preload_title] || {};

                    if (field.type === "select") {
                        return (
                            <div key={fieldName} className="edit-form-field">
                                <label>{field.label}</label>
                                <select defaultValue=""
                                    {...register(fieldName, getValidationRules(field))}
                                    onChange={() => onOptionChange(fieldName)}
                                >
                                    <option value="" disabled>
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

                    if (field.type === "file") {
                        return (
                            <div key={fieldName} className="edit-form-field">
                                <label>{field.label}</label>
                                <input
                                    type="file"
                                    {...register(fieldName, getValidationRules(field))}
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
                                    {...register(fieldName, getValidationRules(field))}
                                    rows={4}
                                />
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    {...register(fieldName, getValidationRules(field))}
                                    onChange={(fieldName === "email" || null) && onEmailChange}
                                    disabled={fieldName === "login"}
                                />
                            )}
                            {errors[fieldName] && (
                                <p>{errors[fieldName].message}</p>
                            )}
                        </div>
                    );
                })}
                <div className="modal-buttons">
                    <button id="confirmBtn" type="submit">Сохранить</button>
                    <button id="cancelBtn" onClick={onClose}>Отмена</button>
                </div>
            </form>
        </div>
    );
}
