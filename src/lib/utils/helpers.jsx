import axios from "../contexts/axiosInstance";
import DeleteForm from "../../components/layout/DeleteForm";
import DynamicForm from "../../components/layout/DynamicForm";
import { CACHE_TIME_SECONDS } from "../constants";
import { TABLE_PAGES_CONFIG } from "../pages";


export function navbarClickHandler(e) {
    e.stopPropagation();
    const nav = document.querySelector('nav');
    const target = e.target.closest('a');
    const dropdownToggler = e.target.tagName === "P" ? e.target.closest('.dropdown-container') : null;

    // Mark the clicked link as active
    if (target && !target.classList.contains('active')) {
        document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
        target.classList.add('active');
    }

    if (dropdownToggler && !target) {
        // select all the dropdown links that are not inside a dropdown container
        const links = dropdownToggler.querySelectorAll(':scope > .dropdown-link');
        // Toggle the display mode for dropdown links
        let dropdownModeToSet = links[0].style.display === 'block' ? 'none' : 'block';
        // Apply the new display mode to each dropdown link
        links.forEach(link => {
            link.style.display = dropdownModeToSet;
        });
        // Update the arrow indicator to reflect the dropdown's open/closed state
        const arrow = dropdownToggler.querySelector('p');
        if (arrow) {
            arrow.textContent = arrow.textContent.slice(0, -1) + (dropdownModeToSet === 'block' ? '▲' : '▼');
        }
    }
    else
        // Close the nav if it is open
        nav.style.left = '-1000px';
}

export const loadDataPreload = async (setPreload, setError, TABLE_PAGES_CONFIG, config) => {
    try {
        const preloadData = {};

        // map each key -> either from cache or fresh fetch
        await Promise.all(
            config.preload.map(async (key) => {
                const resource = TABLE_PAGES_CONFIG[key]["resource"];
                const singularKey = TABLE_PAGES_CONFIG[key].singular || key;
                const cacheKey = `preload_${resource}`;

                // check localStorage cache for this resource
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_TIME_SECONDS) {
                        // cache still valid
                        preloadData[singularKey] = data;
                        return;
                    }
                }

                // fetch fresh if no cache or expired
                const resp = await axios.get("/" + resource);
                let raw_data = resp.data.body;
                if ("pagination" in raw_data) raw_data = raw_data["list"];

                const prepped = raw_data.reduce((acc, item) => {
                    const id = item.id || item._id || item.ID;
                    const name = item.name || item.title || item.fio || id;
                    acc[id] = { ...item, name };
                    Object.entries(item).forEach(([field, value]) => {
                        if (field.endsWith("_id") && field !== "id" && field !== "_id") {
                            acc[id][field] = value;
                        }
                    });
                    return acc;
                }, {});

                // save cache per resource
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: prepped,
                    timestamp: Date.now(),
                }));

                preloadData[singularKey] = prepped;
            })
        );

        setPreload(preloadData);

    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки справочных данных");
    }
};


export const loadDataTable = async (setData, setLoading, setError, config, params = {}) => {
    try {
        setLoading(true);

        const queryString = Object.entries(params)
            .filter(([, val]) => val !== undefined && val !== null && val !== "")
            .map(([key, val]) => { 
                if (Array.isArray(val))
                    return `filter[${encodeURIComponent(key)}]=${encodeURIComponent(val.join(","))}`;
                return `${encodeURIComponent(key)}=${encodeURIComponent(val)}` })
            .join("&");

        const url = `/${config.resource}${queryString ? `?${queryString}` : ""}`;

        // console.log("Final url:", url);

        const mainRes = await axios.get(url);
        // go thru objects in mainRes.data.body.list
        // if the object has executor field, replace it with executor_id and executor_name fields
        let main_data = mainRes.data.body;
        if ("pagination" in main_data) {
            mainRes.data.pagination = main_data.pagination;
            main_data = main_data["list"];
        }
        main_data = main_data.map(item => {
            if ("executor" in item && item.executor && typeof item.executor === "object") {
                item.executor_id = item.executor.id;
                item.executor_name = item.executor.name || item.executor.fio || item.executor.login || item.executor_id;
                delete item.executor;
            }
            // same with creator
            if ("creator" in item && item.creator && typeof item.creator === "object") {
                item.creator_id = item.creator.id;
                item.creator_name = item.creator.name || item.creator.fio || item.creator.login || item.creator_id;
                delete item.creator;
            }
            return item;
        });
        mainRes.data.body = main_data;
        setData(mainRes.data);
    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных таблицы");
    } finally {
        setLoading(false);
    }
};


export function onDelete(setModalContent, closeModal, id = null, url, trigger_table_reload) {
    const data_to_delete = [...document.querySelectorAll(
        ".custom-table tbody tr"
    )].filter(
        // visible rows with checked checkboxes
        r => r.querySelector("td:first-child input[type='checkbox']")?.checked && r.offsetParent !== null
    );

    if (data_to_delete.length !== 0 || id)
        setModalContent(
            <DeleteForm data={data_to_delete} onClose={closeModal} id={id} url={url} trigger_table_reload={trigger_table_reload} />
        );
}


export async function onCreateSubmit(new_data, itemData, closeModal, url, has_file_field=false, setRefreshKey=null) {
    if (has_file_field)
        new_data["_files"] = {};

    Object.entries(new_data).forEach(([key, val]) => {
        if (val instanceof FileList) {
            if (val.length > 0) {
                new_data["_files"][key] = val;
            }
            delete new_data[key];

        // Handle empty values (nulls, empty arrays/objects)
        } else if (
            !val ||
            (Array.isArray(val) && val.length === 0) ||
            (typeof val === "object" && Object.keys(val).length === 0)
        ) {
            if (!itemData) {
                delete new_data[key];
            } else if (
                !itemData[key] ||
                (Array.isArray(itemData[key]) && itemData[key].length === 0) ||
                (typeof itemData[key] === "object" && Object.keys(itemData[key]).length === 0)
            ) {
                delete new_data[key];
            } else {
                new_data[key] = null;
            }

        // Convert to number if its an id
        } else if (
            (typeof itemData?.[key] === "number" && !isNaN(itemData[key])) ||
            key.slice(-3) === "_id"
        ) {
            new_data[key] = Number(val);

        // Convert array of numeric strings to numbers
        } else if (
            Array.isArray(val) &&
            val.length > 0 &&
            /^-?\d+$/.test(val[0])
        ) {
            new_data[key] = val.map(Number);

        // Format date/duration strings
        } else if (val && (key.includes("date") || key.includes("duration"))) {
            let formatted = String(val);
            if (formatted.includes("T")) {
                formatted += ":00+05:00";
            }
            new_data[key] = formatted;

        // Trim strings
        } else if (typeof val === "string") {
            new_data[key] = val.trim();
        }
    });

    console.log("Form submitted with data:", new_data);

    try {
        if (!itemData) {
            // CREATE NEW
            console.log("Creating new item:", new_data);
            if (url === "user" && new_data["permissions"]){
                const permissions_data = {"has_access_ids": [], "no_access_ids": []};
                const all_permissions = JSON.parse(localStorage.getItem("preload_permission"))?.data || {};
                Object.values(all_permissions).forEach(permission => {
                    if (new_data["permissions"].includes(permission.id)) {
                        permissions_data["has_access_ids"].push(permission.id);
                    } else {
                        permissions_data["no_access_ids"].push(permission.id);
                    }
                });
                new_data["has_access_ids"] = permissions_data["has_access_ids"];
                new_data["no_access_ids"] = permissions_data["no_access_ids"];
                delete new_data["permissions"];
            }
            // check if we have files
            if (has_file_field) {
                const _files = {...new_data["_files"]};
                delete new_data["_files"];

                const formData = new FormData();
                // Append JSON as string under key "data"
                formData.append("data", JSON.stringify(new_data));

                // Append files
                Object.entries(_files).forEach(([key, val]) => {
                    if (val instanceof FileList) {
                        for (let i = 0; i < val.length; i++) {
                            formData.append(key, val[i]);
                        }
                    }
                });

                await axios.post("/" + url, formData);
            } else {
                // No files, just send JSON
                await axios.post("/" + url, new_data);
            }

            setRefreshKey(prev => prev + 1);
            console.log("Created successfully");
        } else {
            // EDIT EXISTING
            new_data.id = itemData.id;  // for correct update url

            const changedFields = {};
            const changedFiles = {...new_data["_files"]};
            delete new_data["_files"];

            if (url === "user" && new_data["permissions"]){
                const permissions_data = {"has_access_ids": [], "no_access_ids": []};
                const all_permissions = JSON.parse(localStorage.getItem("preload_permission"))?.data || {};
                Object.values(all_permissions).forEach(permission => {
                    if (new_data["permissions"].includes(permission.id)) {
                        permissions_data["has_access_ids"].push(permission.id);
                    } else {
                        permissions_data["no_access_ids"].push(permission.id);
                    }
                });
                new_data["has_access_ids"] = permissions_data["has_access_ids"];
                new_data["no_access_ids"] = permissions_data["no_access_ids"];
                delete new_data["permissions"];
            }

            for (const key in new_data) {
                if (key === "login") continue;
                const newVal = new_data[key];
                const oldVal = itemData[key];

                const isDifferent =
                    ((typeof newVal === "string" || typeof newVal === "number" || typeof newVal === "boolean" || newVal === null) && newVal !== oldVal) ||
                    (newVal instanceof FileList && newVal.length > 0) ||
                    (Array.isArray(newVal) &&
                        (!Array.isArray(oldVal) ||
                            newVal.length !== oldVal.length ||
                            !newVal.every((v, i) => v === oldVal[i]))) ||
                    (typeof newVal === "object" &&
                        newVal !== null &&
                        !Array.isArray(newVal) &&
                        !(newVal instanceof FileList) &&
                        JSON.stringify(newVal) !== JSON.stringify(oldVal));

                if (isDifferent) changedFields[key] = newVal;
            }

            if (Object.keys(changedFields).length > 0 || Object.keys(changedFiles).length > 0) {
                console.log("Editing existing item with changed fields:", changedFields);
                console.log("and changed files:", changedFiles);

                // If we have file changes, use multipart/form-data
                if (has_file_field) {
                    const formData = new FormData();
                    formData.append("data", JSON.stringify(changedFields));

                    Object.entries(changedFiles).forEach(([key, val]) => {
                        if (val instanceof FileList) {
                            for (let i = 0; i < val.length; i++) {
                                formData.append(key, val[i]);
                            }
                        }
                    });

                    await axios.put(`/${url}/${new_data.id}`, formData);
                } else {
                    // No file changes, send as JSON
                    await axios.put(`/${url}/${new_data.id}`, changedFields);
                }


                setRefreshKey(prev => prev + 1);
            } else {
                console.log("No changes detected, not submitting");
            }
        }
        closeModal(); // Only close modal if no errors
    } catch (err) {
        console.error("API error:", err.message);
        // Optional: show error message to user here
        throw err;
    }
}

export function onCreate(setModalContent, closeModal, preload, FORM_CONFIG, url, itemData = null, show_history = false, setRefreshKey=null, page_name=null) {
    let has_file_field = Object.values(FORM_CONFIG).some(field => field.type.toLowerCase().includes("file"));
    setModalContent(
        <DynamicForm
            config={FORM_CONFIG}
            preloadData={preload}
            onSubmit={(new_data) => onCreateSubmit(new_data, itemData, closeModal, url, has_file_field, setRefreshKey)}
            onClose={closeModal}
            itemData={itemData}
            show_history={show_history}
            page_name={page_name}
        />
    );
}


export function hide_credentials(credentials, method) {
    if (method === "email") {
        const atIndex = credentials.indexOf('@');
        if (atIndex > 2) {
            return credentials.slice(0, 2) + '***' + credentials.slice(atIndex);
        } else {
            return credentials.slice(0, 1) + '***' + credentials.slice(atIndex);
        }
    } else if (method === "phone") {
        const digitsOnly = credentials.replace(/\D/g, '');
        if (digitsOnly.length < 4) return credentials; // Not enough digits to mask
        return digitsOnly.slice(0, 2) + '***' + digitsOnly.slice(-2);
    }
    return credentials; // Default case, return as is
}


export function isValidCredsInput(input, cred_type=null, blank=true){
    const trimmed = input.trim();
    if (trimmed === ""){
        if (!blank) return "Поле не может быть пустым";
        return "";
    }

    if (cred_type === "email" || !cred_type){
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(trimmed)) return "";
        if (trimmed.includes('@') || cred_type) return 'Неверный формат email';
    }

    if (cred_type === "phone" || !cred_type){
        if (/[^+\d\s]/.test(trimmed)) return 'Недопустимые символы в номере';
        if ((trimmed.match(/\+/g) || []).length > 1) return 'Только один "+" разрешён';
        if (trimmed.includes('+') && !trimmed.startsWith('+')) return '"+ должен быть в начале';
    
        const digitsOnly = trimmed.replace(/\s/g, '').replace(/^\+/, '');
        if (digitsOnly.length < 9 || digitsOnly.length > 12) return 'Номер должен содержать от 9 до 12 цифр';
        if (trimmed.startsWith("+") && digitsOnly.length < 12) return 'Номер должен содержать 12 цифр, после знака "+"';
        if (digitsOnly.length === 12 && !digitsOnly.startsWith("992")) return 'Номер должен начинаться с 992';
    }
    return "";
};


export function validate_confirmation(confirmation) {
    // valid token:
    // 1.   4 digit string
    // 2.   a hash string with 32 characters consisting of a-f, A-F, 0-9
    if (/^\d{4}$/.test(confirmation) || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(confirmation)) return true;
    return false;
}


export const onSandwitchClick = () => {
    const nav = document.querySelector("nav");
    nav.style.left = nav.style.left === "0px" ? "-1000px" : "0px";
}


export const onEmailChange = (e => {
    const email = e.target.value;
    const loginField = document.querySelector('input[name="login"]');
    loginField.value = email.split("@")[0];
})


export function getDefaultValues(itemData = null, config = {}, preloadData = {}) {
    const defaults = {};

    if (itemData) {
        for (let key in config) {
            if (itemData[key] !== undefined) {
                if (config[key].type === "multiselect") {
                    defaults[key] = itemData[key].map(String);
                } else if (itemData[key] && (config[key].type === "date" || config[key].type === "datetime-local")) {
                    let formatted = itemData[key];
                    if (itemData[key].includes("T"))
                        formatted = itemData[key].slice(0, itemData[key].indexOf("T") + 6);
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
                id => preloadData["Статус"][id].name.startsWith("Актив")
                    || preloadData["Статус"][id].name.startsWith("Открыт")
            );
            defaults["status_id"] = default_status_id;
        }
    }

    return defaults;
}


export const getValidationRules = (field) => {
    const rules = {};

    if (field.required)
        rules.required = `"${field.label}" обязательно для заполнения`;

    if (field.label === "Телефон") {
        rules.pattern = {
            value: /^\+?[0-9\s()-]{5,18}$/,
            message: "Неправильный формат телефона",
        };
    }

    if (field.type === "text") {
        rules.minLength = { value: field?.min || 1, message: `Слишком мало символов` };
        rules.maxLength = { value: field?.max || 255, message: `Слишком много символов (255)` };
    } else if (field.type === "number") {
        rules.min = { value: 0, message: `Это число не может быть отрицательным` };
        rules.max = { value: 2 ** 32 - 1, message: `Слишком большое  число` };
        rules.valueAsNumber = true;
    } else if (field.type === "email") {
        rules.pattern = {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "Неправильный формат email",
        };
    } else if (field.type === "date" || field.type === "datetime-local") {
        rules.validate = {
            isValidDate: (value) => {
                if (!value) return true; // allow empty if not required
                const date = new Date(value);
                return !isNaN(date.getTime()) || `Некорректная дата`;
            },
        };
    } else if (field.type === "multiselect") {
        rules.validate = { notEmpty: (val) => val?.length > 0 || `Выберите хотя бы один вариант для ${field.label.toLowerCase()}`, };
    }

    return rules;
};

export function getDisabledFields(itemData, config, preloadData, permissions) {
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


export function capitalizeName(str) {
  if (!str) return "";

  return str
    .split(" ")
    .map(word =>
      word
        .split("-")
        .map(part =>
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-")
    )
    .join(" ");
}
