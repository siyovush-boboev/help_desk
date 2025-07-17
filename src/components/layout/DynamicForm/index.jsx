import { useForm } from "react-hook-form";

export default function DynamicForm({ config, preloadData, onSubmit, onClose, itemData = null }) {
    if (!("Статус" in preloadData))
        preloadData["Статус"] = { "1": "Активен", "0": "Неактивен" };

    const defaultValues = {};

    if (itemData) {
        for (const key in config) {
            if (itemData[key] !== undefined) {
                // For multiselects (arrays), assign as is
                if (config[key].type === "multiselect")
                    defaultValues[key] = itemData[key].map(String); // convert to string for checkbox value match
                else
                    defaultValues[key] = itemData[key];
            }
        }
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues });

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
            rules.validate = {
                notEmpty: (val) =>
                    val?.length > 0 || `Выберите хотя бы один вариант для ${field.label.toLowerCase()}`,
            };
        }

        return rules;
    };

    return (
        <div className="modal-content">
            <p>{itemData ? "Создание" : "Редактирование"}</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate id="editForm">
                {Object.entries(config).map(([fieldName, field]) => {
                    let preload_title = field.label || fieldName;
                    if (preload_title === "Исполнитель" || preload_title === "Заявитель")
                        preload_title = "Пользователь";
                    const preloadOptions = preloadData?.[preload_title] || {};
                    if (field.type === "select") {
                        return (
                            <div key={fieldName} className="edit-form-field">
                                <label>{field.label}</label>
                                <select defaultValue=""
                                    {...register(fieldName, getValidationRules(field))}
                                >
                                    <option value="" disabled>
                                        Выберите {field.label.toLowerCase()}
                                    </option>
                                    {Object.entries(preloadOptions).map(([id, name]) => (
                                        <option key={id} value={id}>
                                            {name}
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
                                            // checked={field.value?.includes(Number(val))}
                                            />
                                            <span>{label}</span>
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
