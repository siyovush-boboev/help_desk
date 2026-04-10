import { useMemo, useState } from "react";
import axios from "../../lib/contexts/axiosInstance";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";

export default function BindAdLinkForm({ params = {}, onClose, onResult }) {
    const [loading, setLoading] = useState(false);

    const preloadData = useMemo(() => {
        const resources = ["department", "otdel", "role", "branch", "office", "status", "position"];
        const res = {};
        for (const r of resources) {
            try {
                const raw = localStorage.getItem(`preload_${r}`);
                const parsed = raw ? JSON.parse(raw) : null;
                res[r] = parsed?.data || {};
            } catch {
                res[r] = {};
            }
        }
        return res;
    }, []);

    const filterLabels = useMemo(() => {
        const labels = {};
        (TABLE_PAGES_CONFIG?.user?.filters || []).forEach((f) => {
            if (f?.id) labels[f.id] = f.label || f.id;
        });
        return labels;
    }, []);

    const filterPreloadResource = useMemo(() => {
        return {
            department_id: "department",
            otdel_id: "otdel",
            role_id: "role",
            branch_id: "branch",
            office_id: "office",
            status_id: "status",
            position_id: "position",
        };
    }, []);

    const humanizedFiltersText = useMemo(() => {
        const entries = Object.entries(params || {}).filter(([k]) => k.startsWith("filter["));
        if (entries.length === 0) return "";

        return entries
            .map(([k, v]) => {
                const fieldId = k.slice("filter[".length, -1);
                const label = filterLabels[fieldId] || fieldId;
                const tokens = String(v || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

                const preloadResource = filterPreloadResource[fieldId];
                const preloadMap = preloadResource ? preloadData[preloadResource] : null;

                const valueText = tokens
                    .map((token) => {
                        if (preloadMap && token in preloadMap) return preloadMap[token]?.name || preloadMap[token]?.title || preloadMap[token]?.fio || preloadMap[token]?.id || token;
                        if (preloadMap && /^\d+$/.test(token)) return "Неизвестно";
                        return token;
                    })
                    .join(", ");

                return `${label}: ${valueText || "-"}`;
            })
            .join(" • ");
    }, [params, filterLabels, filterPreloadResource, preloadData]);

    const filtersText = useMemo(() => {
        const entries = Object.entries(params || {}).filter(([k]) => k.startsWith("filter["));
        if (entries.length === 0) return "без фильтров";
        return entries.map(([k, v]) => `${k}=${v}`).join(", ");
    }, [params]);

    const hasFilters = useMemo(() => {
        return Object.keys(params || {}).some((k) => k.startsWith("filter["));
    }, [params]);

    const handleConfirm = async (e) => {
        e.stopPropagation();
        if (loading) return;

        try {
            setLoading(true);
            await axios.post("/user/bind-ad-usernames", null, { params });
            onClose?.();
            onResult?.("Привязка запущена");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Ошибка привязки";
            onClose?.();
            onResult?.(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-form">
            <p>Привязать AD link для пользователей по текущим фильтрам?</p>
            {!hasFilters ? (
                <small className="bind-ad-link-hint">
                    Фильтры не выбраны — будет выполнена привязка для всех пользователей.
                </small>
            ) : (
                <small className="bind-ad-link-hint">{humanizedFiltersText || filtersText}</small>
            )}

            <div className="modal-buttons">
                <button id="confirmBtn" onClick={handleConfirm} disabled={loading}>
                    {loading ? "Привязка..." : "Подтвердить"}
                </button>

                <button
                    id="cancelBtn"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!loading) onClose?.();
                    }}
                    disabled={loading}
                >
                    Отмена
                </button>
            </div>
        </div>
    );
}
