// import { fetcher } from "../services/api/fetcher.js";
import axios from "../contexts/axiosInstance";
import DeleteForm from "../../components/layout/DeleteForm";
import DynamicForm from "../../components/layout/DynamicForm";


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
        const preloadResults = await Promise.all(
            config.preload.map((key) =>
                axios.get("/" + TABLE_PAGES_CONFIG[key]["resource"])
            )
        );

        const preloadData = {};
        config.preload.forEach((key, i) => {
            const singularKey = TABLE_PAGES_CONFIG[key].singular || key;
            let raw_data = preloadResults[i].data.body;
            if ("pagination" in raw_data)
                raw_data = raw_data["list"]
            const prepped = raw_data.reduce((acc, item) => {
                const id = item.id || item._id || item.ID;
                const name = item.name || item.title || item.fio || id;
                acc[id] = { ...item, name };
                Object.entries(item).forEach(([field, value]) => {
                    if (field.endsWith("_id") && field !== "id" && field !== "_id")
                        acc[id][field] = value;
                });
                return acc;
            }, {});
            preloadData[singularKey] = prepped;
        });

        setPreload(preloadData);
    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных");
    }
};


export const loadDataTable = async (setData, setLoading, setError, config, params = {}) => {
    try {
        // console.log("Loading data with params:", params);
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
        setData(mainRes.data);
    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки таблицы");
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


export async function onCreateSubmit(new_data, itemData, closeModal, url, has_file_field=false, setRefreshKey) {
    let files_to_upload = {};
    
    // Convert fields properly
    Object.entries(new_data).forEach(([key, val]) => {
        // check if the value if a file
        if (val instanceof FileList) {
            if (val.length > 0)
                files_to_upload[key] = val;
            delete new_data[key];
        } else if (val === 0 || val === "" || (Array.isArray(val) && val.length === 0))
            delete new_data[key]; // Remove empty fields
        else if ((typeof itemData?.[key] === "number" && !isNaN(itemData?.[key])) || key.slice(-3) === "_id")
            new_data[key] = Number(val);
        else if (Array.isArray(val) && val.length > 0 && /^-?\d+$/.test(val[0]))
            new_data[key] = val.map(Number);
    });
    if (Object.keys(files_to_upload).length > 0) {
        files_to_upload.data = { ...new_data };
        new_data = files_to_upload;
    }

    try {
        if (!itemData) {
            // CREATE NEW
            // check if we have files
            if (has_file_field || Object.keys(files_to_upload).length > 0) {
                console.log("Creating new item", files_to_upload);
                const formData = new FormData();

                // Append JSON as string under key "data"
                formData.append("data", JSON.stringify(files_to_upload.data));

                // Append files
                Object.entries(files_to_upload).forEach(([key, val]) => {
                    if (key === "data") return; // skip the JSON object
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
            new_data.id = itemData.id; // Keep id just in case

            const changedFields = {};
            const changedFiles = {};

            for (const key in new_data) {
                if (key === "login") continue;
                // if (key === "duration") {
                //     itemData[key] = itemData[key]?.slice(0, 16);
                // }
                const newVal = new_data[key];
                const oldVal = itemData[key];

                const isDifferent =
                    ((typeof newVal === "string" || typeof newVal === "number" || typeof newVal === "boolean") && newVal !== oldVal) ||
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

                if (isDifferent) {
                    if (newVal instanceof FileList && newVal.length > 0) {
                        changedFiles[key] = newVal; // store files separately
                    } else {
                        changedFields[key] = newVal;
                    }
                }
            }

            if (Object.keys(changedFields).length > 0 || Object.keys(changedFiles).length > 0) {
                console.log("Editing existing item with changed fields:", changedFields);

                // If we have file changes, use multipart/form-data
                if (has_file_field || Object.keys(changedFiles).length > 0) {
                    const formData = new FormData();
                    formData.append("data", JSON.stringify({ ...changedFields, id: new_data.id }));

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

                console.log("Updated successfully");
            } else {
                console.log("No changes detected, not submitting");
            }
        }
        closeModal(); // Only close modal if no errors
    } catch (err) {
        console.error("API error:", err.message);
        // Optional: show error message to user here
    }
}

export function onCreate(setModalContent, closeModal, preload, FORM_CONFIG, url, itemData = null, show_history = false, setRefreshKey=null) {
    let has_file_field = false;
    for (const key in FORM_CONFIG) { if (FORM_CONFIG[key].type === "file") { has_file_field = true; break; }}

    setModalContent(
        <DynamicForm
            config={FORM_CONFIG}
            preloadData={preload}
            onSubmit={(new_data) => onCreateSubmit(new_data, itemData, closeModal, url, has_file_field, setRefreshKey)}
            onClose={closeModal}
            itemData={itemData}
            show_history={show_history}
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


export function isValidCredsInput(input){
    const trimmed = input.trim();
    if (trimmed === "") return "";

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(trimmed)) return "";
    if (trimmed.includes('@')) return 'Неверный формат email';

    if (/[^+\d\s]/.test(trimmed)) return 'Недопустимые символы в номере';
    if ((trimmed.match(/\+/g) || []).length > 1) return 'Только один "+" разрешён';
    if (trimmed.includes('+') && !trimmed.startsWith('+')) return '"+ должен быть в начале';

    const digitsOnly = trimmed.replace(/\s/g, '').replace(/^\+/, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 12) return 'Номер должен содержать от 9 до 12 цифр';
    if (trimmed.startsWith("+") && digitsOnly.length < 12) return 'Номер должен содержать 12 цифр, после знака "+"';
    if (digitsOnly.length === 12 && !digitsOnly.startsWith("992")) return 'Номер должен начинаться с 992';

    return "";
};


export function validate_confirmation(confirmation) {
    // valid token:
    // 1.   4 digit string
    // 2.   a hash string with 32 characters consisting of a-f, A-F, 0-9
    if (/^\d{4}$/.test(confirmation) || /^[a-fA-F0-9]{32}$/.test(confirmation)) return true;
    return false;
}
