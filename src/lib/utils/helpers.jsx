import { useContext } from 'react';
import { AuthContext } from '../contexts/authBS.js';
import { fetcher } from "../services/api/httpClient.js";
import DeleteForm from "../../components/layout/DeleteForm";
import DynamicForm from "../../components/layout/DynamicForm";


// Hook to use auth context anywhere
export function useAuth() {
    return useContext(AuthContext);
}

export function navbarClickHandler(e) {
    e.stopPropagation();
    const nav = document.querySelector('nav');
    const target = e.target.closest('a');
    const dropdownToggler = e.target.closest('.dropdown-container');

    // Mark the clicked link as active
    document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
    if (target)
        target.classList.add('active');

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
                fetcher({ url: "/" + TABLE_PAGES_CONFIG[key]["resource"] })
            )
        );

        const preloadData = {};
        config.preload.forEach((key, i) => {
            const singularKey = TABLE_PAGES_CONFIG[key].singular || key;
            const raw = preloadResults[i];
            const prepped = raw.result.reduce((acc, item) => {
                const id = item.id || item._id || item.ID;
                const name = item.name || item.title || item.fio || id;
                acc[id] = { name: name };
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

export const loadDataTable = async (setData, setLoading, setError, config, filters = {}) => {
    try {
        setLoading(true);
        const allEmpty = Object.values(filters).every(arr => arr.length === 1 && arr[0] === "");
        let queryString = "";
        if (!allEmpty) {
            queryString = new URLSearchParams(filters).toString();
        }
        const url = `/${config.resource}?${queryString}`;
        const mainRes = await fetcher({ url });
        setData(mainRes);
    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки таблицы");
    } finally {
        setLoading(false);
    }
};


export function onDelete(setModalContent, closeModal, id = null, url) {
    const data_to_delete = [...document.querySelectorAll(
        ".custom-table tbody tr"
    )].filter(
        // visible rows with checked checkboxes
        r => r.querySelector("td:first-child input[type='checkbox']")?.checked && r.offsetParent !== null
    );

    if (data_to_delete.length !== 0 || id)
        setModalContent(
            <DeleteForm data={data_to_delete} onClose={closeModal} id={id} url={url} />
        );
}



export async function onCreateSubmit(new_data, itemData, closeModal, url) {
    // Convert number-like fields properly
    Object.entries(new_data).forEach(([key, val]) => {
        if ((typeof itemData?.[key] === "number" && !isNaN(itemData?.[key])) || key.slice(-3) === "_id") {
            new_data[key] = Number(val);
        } else if (Array.isArray(val)) {
            new_data[key] = val.map(Number);
        }
    });

    try {
        if (!itemData) {
            // CREATE NEW
            console.log("Creating new item", new_data);
            await fetcher({
                url: "/" + url,
                method: "POST",
                body: new_data,
            });
            console.log("Created successfully");
        } else {
            // EDIT EXISTING - collect only changed fields for PATCH
            new_data.id = itemData.id; // Keep id just in case

            const changedFields = {};
            for (const key in new_data) {
                if (key === "login")
                    continue;
                if (key === "duration") {
                    itemData[key] = itemData[key]?.slice(0, 16);;
                }
                const newVal = new_data[key];
                const oldVal = itemData[key];

                const isDifferent =
                    // check primitive changes
                    ((typeof newVal === "string" || typeof newVal === "number" || typeof newVal === "boolean") && newVal !== oldVal) ||

                    // check FileList with length > 0
                    (newVal instanceof FileList && newVal.length > 0) ||

                    // check arrays for diff length or items
                    (Array.isArray(newVal) &&
                        (!Array.isArray(oldVal) ||
                            newVal.length !== oldVal.length ||
                            !newVal.every((v, i) => v === oldVal[i]))) ||

                    // shallow object diff by JSON stringify
                    (typeof newVal === "object" &&
                        newVal !== null &&
                        !Array.isArray(newVal) &&
                        !(newVal instanceof FileList) &&
                        JSON.stringify(newVal) !== JSON.stringify(oldVal));

                if (isDifferent) {
                    changedFields[key] = newVal;
                }
            }

            if (Object.keys(changedFields).length > 0) {
                console.log("Editing existing item with changed fields:", changedFields);
                await fetcher({
                    url: `/${url}/${new_data.id}`,
                    method: "PATCH",
                    body: changedFields,
                });
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

export function onCreate(setModalContent, closeModal, preload, FORM_CONFIG, url, itemData = null) {
    setModalContent(
        <DynamicForm
            config={FORM_CONFIG}
            preloadData={preload}
            onSubmit={(new_data) => onCreateSubmit(new_data, itemData, closeModal, url)}
            onClose={closeModal}
            itemData={itemData}
        />
    );
}
