import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";
import { priority_colors, BASE_URL, API_BASE_URL } from "../../lib/constants";
import { loadDataPreload, convertRFCtoLocalDatetimeInput, cleanString, downloadFile } from "../../lib/utils/helpers";


const PAGE_NAME = "report";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];
const FILTER_CONFIG = config["filters"];


export default function Reports() {
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    const navigate = useNavigate();
    if (!permissions.includes(`${PAGE_NAME}:view`)) {
        navigate("/main");
    }
    const [preload, setPreload] = useState({});
    const [error, setError] = useState("");
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [openDropdowns, setOpenDropdowns] = useState({});
    const dropdownRefs = useRef({});
    const [dates, setDates] = useState({ "date_from": "", "date_to": "" })

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config).then(() =>
            setPreloadLoaded(true)
        );
    }, []);

    useEffect(() => {
        const setDefaultDates = () => {
            const today = new Date();
            const dateFrom = new Date(dates.date_from || today);
            dateFrom.setHours(0, 0, 0, 0); // Set time to 00:00
            const dateTo = new Date(dates.date_to || today);
            dateTo.setHours(23, 59, 59, 999); // Set time to 23:59

            setDates({
                date_from: convertRFCtoLocalDatetimeInput(dateFrom), // Format date as YYYY-MM-DDTHH:MM
                date_to: convertRFCtoLocalDatetimeInput(dateTo)
            });
            
            setSearchParams({
                ...Object.fromEntries(searchParams),
                date_from: convertRFCtoLocalDatetimeInput(dateFrom),
                date_to: convertRFCtoLocalDatetimeInput(dateTo),
                format: "xlsx",
            });
        };

        setDefaultDates();
    }, [dates.date_from, dates.date_to, searchParams, setSearchParams]);

    const handleDateChange = (e, id) => {
        const dateString = e.target.value;
        // Update the state for date change
        setDates(prevDates => ({
            ...prevDates,
            [id]: dateString
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const openIds = Object.keys(openDropdowns).filter(id => openDropdowns[id]);
            let clickedInsideAny = false;

            for (const id of openIds) {
                const ref = dropdownRefs.current[id];
                if (ref && ref.contains(event.target)) {
                    clickedInsideAny = true;
                    break;
                }
            }

            if (!clickedInsideAny) {
                console.log("hndl clk outsd func");
                setOpenDropdowns({});
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openDropdowns]);    
    
    const toggleDropdown = (e, filterId) => {
        console.log("toggle func");
        console.log(e.target);
        setOpenDropdowns(prev => ({
            // ...prev,
            [filterId]: !prev[filterId],
        }));
    };

    const filtersFromUrl = useMemo(() => {
        const filters = {};
        // Add default values for missing filters
        FILTER_CONFIG.forEach((filter) => {
            if (!searchParams.has(filter.id)) {
                filters[filter.id] = filter.defaultValue ? [filter.defaultValue] : [];
            }    
        });
        for (const [key, value] of searchParams.entries()) {
            const match = key.match(/^(.+?)$/);
            if (match) {
                filters[match[1]] = value.split(",");
            } else {
                filters[key] = value;
            }    
        }
        return filters;
    }, [searchParams]);    

    const updateFilter = (id, value) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (Array.isArray(value)) {
            if (value.length > 0) {
                newParams.set(id, value.join(","));
            } else {
                newParams.delete(id);
            }    
        } else if (value) {
            newParams.set(id, value);
        } else {
            newParams.delete(id);
        }    
        setSearchParams(newParams);
    };    

    const handleCheckboxChange = (filterId, val) => {
        const prevVals = new Set(filtersFromUrl[filterId] || []);
        if (prevVals.has(val)) {
            prevVals.delete(val);
        } else {
            prevVals.add(val);
        }
        updateFilter(filterId, Array.from(prevVals));
    };

    const handleDownload = async () => {
        // Create the URL with search params
        const url = new URL(API_BASE_URL + "/report", window.location.origin);

        // Append all current search parameters to the URL
        for (const [key, value] of searchParams.entries()) {
            url.searchParams.set(key, value);
        }

        // Get and format both date_from and date_to from the searchParams
        let formattedDateFrom = convertRFCtoLocalDatetimeInput(searchParams.get("date_from"));
        let formattedDateTo = convertRFCtoLocalDatetimeInput(searchParams.get("date_to"));

        // remove time from formatted
        formattedDateFrom = formattedDateFrom.split("T")[0];
        formattedDateTo = formattedDateTo.split("T")[0];

        // Determine the file extension based on the selected format
        const selectedFormat = filtersFromUrl["format"]?.[0] || "xlsx"; // Default to "xlsx" if not selected
        const fileExtension = selectedFormat === "csv" ? ".csv" : ".xlsx";

        // Create the filename based on the date range
        const fileName = `report_help_desk_${cleanString(formattedDateFrom)}_${cleanString(formattedDateTo)}${fileExtension}`;

        try {
            // Download the file using the downloadFile function
            await downloadFile(url.href, fileName, setError);
        } catch (error) {
            setError('Не удалось загрузить отчет');
            console.error('Download failed:', error);
        }
    };

    const renderFilterInput = (filter) => {
        const { id, label } = filter;
        const value = filtersFromUrl[id] || [];

        if (id.includes("_id")) {
            const preload_name = TABLE_PAGES_CONFIG[
                id.replace("_ids", "").replace("_id", "").replace("executor", "user")
            ]?.singular;

            const optionsObj = preload[preload_name] || {};
            const options = Object.entries(optionsObj);

            const selectedLabels = value
                .map(val => optionsObj[val]?.name)
                .filter(Boolean);

            const displayText = selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : "Не выбрано";

            const truncatedText = displayText.length > 32
                ? displayText.slice(0, 32) + "..."
                : displayText;

            return (
                <div className="report-filter-group" key={id} ref={el => dropdownRefs.current[id] = el}>
                    <label>{label}</label>
                    <div className="report-filter-dropdown">
                        <div className="report-dropdown-header" onClick={(e) => toggleDropdown(e, id)}>
                            <div className="selected-values" title={displayText}>{truncatedText}</div>
                            <div className="dropdown-arrow">{openDropdowns[id] ? "▲" : "▼"}</div>
                        </div>
                        {openDropdowns[id] && (
                            <div className="dropdown-options">
                                {options.map(([key, opt]) => (
                                    <label
                                        key={key}
                                        className="dropdown-option"
                                        style={id === "priority_ids" ? { color: priority_colors[opt.name] || 'inherit' } : {}}
                                        >
                                        <input
                                            type="checkbox"
                                            checked={value.includes(String(opt.id))}
                                            onClick={() => handleCheckboxChange(id, String(opt.id))}
                                        />
                                        {id.includes("status_id") && opt.icon_small && (
                                            <img
                                                src={BASE_URL + opt.icon_small}
                                                alt=""
                                                className="status-icon"
                                            />
                                        )}
                                        <span>{opt.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (id === "date_from" || id === "date_to") {
            return (
                <div key={id} className="report-filter-group">
                    <label>{label}</label>
                    <input
                        type="datetime-local"
                        name={id}
                        value={convertRFCtoLocalDatetimeInput(dates[id])} // Ensures proper date format (YYYY-MM-DDTHH:MM)
                        onInput={(e) => handleDateChange(e, id)}  // Handle date change
                    />
                </div>
            );
        }

        if (id === "format") {
            return (
                <div key={id} className="report-filter-group">
                    <label>{label}</label>
                    <select
                        value={value[0] || "xlsx"}
                        onChange={(e) => updateFilter(id, e.target.value)}
                    >
                        <option value="xlsx">XLSX</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
            );
        }

        return null;
    };

    if (error) return <div className="loader-wrapper"><p>{error}</p></div>;
    if (!preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <div className="report-filter-container">
                <div className="report-filters-list">
                    {FILTER_CONFIG.map(renderFilterInput)}
                </div>

                <div className="modal-buttons">
                    <button id="confirmBtn" onClick={handleDownload}>Скачать</button>
                    <button id="resetBtn" onClick={() => setSearchParams({})}>Сбросить фильтры</button>
                </div>
            </div>
        </>
    );
}
