import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";
import { loadDataPreload } from "../../lib/utils/helpers";
import { priority_colors, BASE_URL } from "../../lib/constants";

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

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config).then(() =>
            setPreloadLoaded(true)
        );
    }, []);

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
                setOpenDropdowns({});
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openDropdowns]);

    const filtersFromUrl = useMemo(() => {
        const filters = {};
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
                newParams.set(`${id}`, value.join(","));
            } else {
                newParams.delete(`${id}`);
            }
        } else if (value) {
            newParams.set(`${id}`, value);
        } else {
            newParams.delete(`${id}`);
        }

        setSearchParams(newParams);
    };

    const toggleDropdown = (filterId) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [filterId]: !prev[filterId],
        }));
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

    const handleDownload = () => {
        const url = new URL("/api/report", window.location.origin);
        for (const [key, value] of searchParams.entries()) {
            url.searchParams.set(key, value);
        }

        window.open(url.toString(), "_blank");
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

            const truncatedText = displayText.length > 40
                ? displayText.slice(0, 38) + "..."
                : displayText;

            return (
                <div className="report-filter-group" key={id} ref={el => dropdownRefs.current[id] = el}>
                    <label>{label}</label>
                    <div className="report-filter-dropdown">
                        <div className="report-dropdown-header" onClick={() => toggleDropdown(id)}>
                            <span className="selected-values" title={displayText}>{truncatedText}</span>
                            <span className="dropdown-arrow">{openDropdowns[id] ? "▲" : "▼"}</span>
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
                                            onChange={() => handleCheckboxChange(id, String(opt.id))}
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
                        value={value[0] || ""}
                        onChange={(e) => {
                            const rfc3339 = e.target.value ? new Date(e.target.value).toISOString() : "";
                            updateFilter(id, rfc3339);
                        }}
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
