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

export const loadDataPreload = async (setPreload, setLoading, setError, TABLE_PAGES_CONFIG, config) => {
    try {
        const preloadResults = await Promise.all(
            config.preload.map((key) =>
                fetcher({ url: "/" + TABLE_PAGES_CONFIG[key]["resource"] })
            )
        );

        const preloadData = {};
        config.preload.forEach((key, i) => {
            key = TABLE_PAGES_CONFIG[key].singular || key;
            const raw = preloadResults[i];
            const prepped = raw.result.reduce((acc, item) => {
                const id = item.id || item._id || item.ID;
                const name = item.name || item.title || item.fio || id;
                acc[id] = name;
                return acc;
            }, {});
            preloadData[key] = prepped;
        });

        setPreload(preloadData);
    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных");
    } finally {
        setLoading(false);
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


export function onDelete(setModalContent, closeModal, id = null) {
    const data_to_delete = [...document.querySelectorAll(
        ".custom-table tbody tr"
    )].filter(
        // visible rows with checked checkboxes
        r => r.querySelector("td:first-child input[type='checkbox']")?.checked && r.offsetParent !== null
    );

    if (data_to_delete.length !== 0 || id)
        setModalContent(
            <DeleteForm data={data_to_delete} onClose={closeModal} id={id} />
        );
}


export function onCreateSubmit(new_data, itemData, closeModal) {
    Object.entries(new_data).map(([key, val]) => {
        if (typeof itemData?.[key] === "number" && !isNaN(itemData?.[key]) || key.slice(-3) === "_id")
            new_data[key] = Number(val);
        else if (Array.isArray(val))
            new_data[key] = val.map(Number);
    })
    // console.log("Create data:", new_data);
    // console.log("passed data:", itemData);
    if (!itemData) {
        console.log("Creating new item");
        console.log("call API here to create data", new_data);
    }
    else {
        new_data.id = itemData.id; // Ensure ID is set for editing
        let new_edits = false;
        for (const key in new_data) {
            const newVal = new_data[key];
            const oldVal = itemData[key];

            // Compare primitives (string, number, boolean)
            if (
                (typeof newVal === "string" || typeof newVal === "number" || typeof newVal === "boolean") &&
                newVal !== oldVal
            ) {
                console.log(`changes in field: ${key}:`, newVal);
                new_edits = true;
            }

            // Compare FileList
            if (
                newVal instanceof FileList &&
                newVal.length > 0
            ) {
                console.log(`changes in field: ${key}:`, newVal);
                new_edits = true;
            }

            // Compare arrays
            if (
                Array.isArray(newVal) &&
                (
                    !Array.isArray(oldVal) ||
                    newVal.length !== oldVal.length ||
                    !newVal.every((v, i) => v === oldVal[i])
                )
            ) {
                console.log(`changes in field: ${key}:`, newVal);
                new_edits = true;
            }

            // Compare objects (shallow)
            if (
                typeof newVal === "object" &&
                newVal !== null &&
                !Array.isArray(newVal) &&
                !(newVal instanceof FileList)
            ) {
                if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                    console.log(`changes in field: ${key}:`, newVal);
                    new_edits = true;
                }
            }
        }
        if (new_edits)
            console.log("call API here to edit data");
        else
            console.log("No changes detected, not submitting");
    }
    closeModal();
}


export function onCreate(setModalContent, closeModal, preload, FORM_CONFIG, itemData = null) {
    setModalContent(
        <DynamicForm
            config={FORM_CONFIG}
            preloadData={preload}
            onSubmit={(new_data) => onCreateSubmit(new_data, itemData, closeModal)}
            onClose={closeModal}
            itemData={itemData}
        />
    );
}
