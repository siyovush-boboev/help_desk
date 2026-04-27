import { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import { loadDataPreload, loadDataTable, onCreate } from "../../lib/utils/helpers";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages";
import { ModalContext } from "../../lib/contexts/ModalContext";
import { ExclaimIcon, ClockIcon, ApplicationsDarkIcon, CheckMarkIcon, ShieldIcon, WatchIcon, UsersDarkIcon, ThunderIcon, ArrowUpIcon, ArrowDownIcon } from "../ui/icons";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";


const PAGE_NAME = "main";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];
const COLORS = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#46f0f0",
    "#f032e6",
    "#bcf60c",
    "#fabebe",
    "#008080",
    "#e6beff",
    "#9a6324",
    "#fffac8",
    "#800000",
    "#aaffc3",
    "#808000",
    "#ffd8b1",
    "#000075",
    "#808080",
];
// 

function StatusPieChart({ dataFromApi }) {
    if (!dataFromApi || dataFromApi.length === 0) return null;

    const total = dataFromApi.reduce((sum, item) => sum + item.count, 0);

    const dataWithPercent = dataFromApi.map((item) => ({
        ...item,
        percent: ((item.count / total) * 100).toFixed(1),
    }));

    const RADIAN = Math.PI / 180;
    const renderLabel = ({ cx, cy, midAngle, outerRadius, payload }) => {
        const radius = outerRadius + 22;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const name = payload?.group_name ?? "";
        const pctNum = total > 0 ? (Number(payload?.count || 0) / total) * 100 : 0;
        const pct = `${pctNum.toFixed(1)}%`;

        return (
            <text
                x={x}
                y={y}
                fill="var(--text-color)"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize={13}
            >
                <tspan x={x} dy="-0.3em">{name}</tspan>
                <tspan x={x} dy="1.2em" fill="var(--text-secondary)">{pct}</tspan>
            </text>
        );
    };

    return (
        <div className="pie-chart-block">
            <div className="pie-chart-canvas">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
                        <Pie
                            data={dataWithPercent}
                            dataKey="count"
                            nameKey="group_name"
                            cx="50%"
                            cy="50%"
                            outerRadius={84}
                            labelLine
                            label={renderLabel}
                        >
                            {dataWithPercent.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value, name, props) => {
                                return [`${value}`, `${props.payload.group_name}`];
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function WeeklyVolumeChart({ dataFromApi }) {
    if (!Array.isArray(dataFromApi) || dataFromApi.length === 0) return null;

    return (
        <div style={{ height: 200, width: "100%" }}>
            <ResponsiveContainer width="100%" height={200} minHeight={200}>
                <BarChart data={dataFromApi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value}`, "Заявок"]} />
                    <Bar dataKey="value" fill="var(--primary-color)" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function ExecutorsBlock({ dataFromApi }) {
    if (!Array.isArray(dataFromApi) || dataFromApi.length === 0) return null;

    const maxCount = Math.max(...dataFromApi.map((e) => Number(e.count) || 0), 0) || 1;

    return (
        <div className="executors-container">
            {dataFromApi.map((e, idx) => {
                const nameRaw = e.group_name || "";
                const name = nameRaw.length > 46 ? `${nameRaw.slice(0, 44)}…` : nameRaw;
                const count = Number(e.count) || 0;
                const pct = Math.max(0, Math.min(100, (count / maxCount) * 100));

                const userId = e.user_id;
                const link = userId ? `/order?filter[executor_id]=${encodeURIComponent(userId)}&withPagination=true&page=1&limit=20` : null;

                return (
                    <Link
                        key={idx}
                        className={`executor-item ${link ? "executor-item-link" : ""}`}
                        to={link || "#"}
                        onClick={(ev) => {
                            if (!link) ev.preventDefault();
                        }}
                    >
                        <div className="executor-item-head">
                            <p className="executor-name">{name}</p>
                            <span className="executor-count">{count}</span>
                        </div>
                        <div className="progress-bar executor-progress">
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}


function TimeGroupsBlock({ groups }) {
    if (!Array.isArray(groups) || groups.length === 0) return null;

    const maxSeconds = Math.max(...groups.map((g) => Number(g.avg_seconds) || 0), 0) || 1;

    return (
        <div className="time-groups-container">
            {groups.map((g, idx) => {
                const pct = Math.max(0, Math.min(100, ((Number(g.avg_seconds) || 0) / maxSeconds) * 100));
                return (
                    <div key={idx} className="time-group-item">
                        <span>
                            <p>{g.group_name}</p>
                            <p>{g.avg_time_formatted}</p>
                        </span>
                        <div className="progress-bar time-group-progress">
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function StatBlock({ title, children }) {
    const contents = {
        weekly_volume: ["Объём заявок за 14 дней"],
        time_by_priority: ["Среднее время по приоритетам"],
        time_by_order_type: ["Среднее время по типам заявок"],
        count_by_executor: ["Заявки по исполнителям", "Кликните по исполнителю — откроются заявки с только с ним"],
        last_activity: ["Недавняя активность"],
        top_categories: ["Топ категорий заявок"],
        count_by_status: ["Количество по статусам", "Текущее состояние заявок"],
        departments: ["Статистика по департаментам банка", "Распределение заявок и производительность по департаментам"],
        branches: ["Статистика по филиалам банка", "Распределение заявок и производительность по филиалам"],
    };

    const title_ru = contents?.[title]?.[0] || title;

    return (
        <div className="stat-item">
            <div className="stat-title">
                <p>{title_ru}</p>
                {contents?.[title]?.[1] && <p>{contents[title][1]}</p>}
            </div>
            {children}
        </div>
    );
}


function Alert({ type, count }) {
    const contents = {
        critical: {
            color: "red",
            main_text: "критических заявок",
            sub_text: "требуют немедленного внимания",
            icon: <ExclaimIcon />,
        },
        overdue: {
            color: "yellow",
            main_text: "просроченных заявок",
            sub_text: "нарушают SLA",
            icon: <ClockIcon />,
        },
    }

    const content = contents?.[type];

    if (!content) return null;
    return (
        <div className={`alert alert-${content.color}`}>
            {content.icon}
            <div className="alert-text">
                <p>{count} {content.main_text}</p>
                <p>{content.sub_text}</p>
            </div>
        </div>
    );
}


function KPIBlock({ title, trend_score, trend_text = "", personal_score = 0 }) {
    const contents = {
        total_orders: ["Всего заявок", <ApplicationsDarkIcon />, "{} ваших заявок"],
        open_orders: ["Открытые заявки", <ClockIcon />, "{} назначено вам"],
        resolved_orders: ["Решённые заявки", <CheckMarkIcon />, "{} решено вами"],
        sla_compliance: ["Соблюдение SLA", <ShieldIcon />],
        avg_response_time: ["Среднее время ответа", <WatchIcon />],
        avg_resolve_time: ["Среднее время решения", <ClockIcon />],
        fcr_rate: ["Уровень первого контакта", <ThunderIcon />],
        active_agents: ["Активные агенты", <UsersDarkIcon />],
    };

    const title_ru = contents?.[title]?.[0] || title;

    return (
        <div className="kpi-item">
            <div className="kpi-title">
                <p>{title_ru}</p>
                {contents?.[title]?.[1]}
            </div>
            <div className="kpi-trend">
                <p className="kpi-trend-score">{trend_score}</p>
                <div className="trend-subtext">
                    <p className="trend-text">
                        {trend_text.startsWith("+") ? <ArrowUpIcon /> : trend_text.startsWith("-") ? <ArrowDownIcon /> : null}
                        {trend_text}
                    </p>
                    <p className="personal-score">{contents?.[title]?.[2]?.replace("{}", personal_score)}</p>
                </div>
            </div>
        </div>
    );
}


function DepartmentsStatBlock({ blocks }) {
    return (
        blocks?.map((block, index) => (
            <div key={index} className="departments-stat-item">

                <div>
                    <p>{block.name}</p>
                    <small className="orders-count">{block.total_count} заявок</small>
                </div>

                <div className="departments-stat-counters">
                    <div className="departments-stat-counters-item"><p>Открытые:</p><span>{block.open_count}</span></div>
                    <div className="departments-stat-counters-item"><p>Решенные:</p><span>{block.resolved_count}</span></div>
                    <div className="departments-stat-counters-item"><p>Критические:</p><span>{block.critical_count}</span></div>
                </div>

                <div className="solved-section">
                    <span>
                        <p>Доля решенных</p>
                        <p>{block.solved_percent}%</p>
                    </span>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${block.solved_percent}%` }}
                        />
                    </div>
                </div>

            </div>
        ))
    );
}


function ActivityBlock({ activities }) {
    return (
        <div className="activities-container">
            {
                activities?.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <p>{activity.order_name}</p>
                        <small>{activity.date} {activity.author_name.length > 32 ? activity.author_name.slice(0, 30) + "..." : activity.author_name}</small>
                        <p>{activity.text.slice(0, 55) + (activity.text.length > 55 ? "..." : "")}</p>
                    </div>
                ))
            }
        </div>
    );
}


function CategoriesBlock({ categories }) {
    return (
        <div className="categories-container categories-container-scroll">
            {
                categories?.map((category, index) => (
                    <div key={index} className="category-item">
                        <p>{category.group_name}</p>
                        <span>{category.count}</span>
                    </div>
                ))
            }
        </div>
    );
}


export default function Main() {
    const [data, setData] = useState([]);
    const [preload, setPreload] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { setModalContent, closeModal } = useContext(ModalContext);
    const [preloadLoaded, setPreloadLoaded] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    const [activeTab, setActiveTab] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    const periodFilters = useMemo(() => {
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (["period", "date_from", "date_to"].includes(key)) {
                filters[key] = value;
            }
        }
        return filters;
    }, [searchParams]);

    const handlePeriodChange = (newFilters) => {
        const newSearchParams = new URLSearchParams(searchParams);
        
        // Clear all period-related params first
        newSearchParams.delete("period");
        newSearchParams.delete("date_from");
        newSearchParams.delete("date_to");
        
        // Then set only the ones that have values
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key] !== null && newFilters[key] !== "") {
                newSearchParams.set(key, newFilters[key]);
            }
        });
        
        setSearchParams(newSearchParams);
    };

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config)
            .then(() => setPreloadLoaded(true));
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config, periodFilters);
    }, [refreshKey, periodFilters]);

    if (loading || !preloadLoaded) return <div className="loader-wrapper"><div className="loader-black"></div></div>;
    if (error) return <div className="loader-wrapper"><div className="loader-wrapper"><p>{error}</p></div></div>;

    // remove unnecessary statuses
    const status_field_key = TABLE_PAGES_CONFIG["status"].singular;
    if (preload[status_field_key]) {
        preload[status_field_key] = Object.fromEntries(
            Object.entries(preload[status_field_key]).filter(([, item]) => [1, 3].includes(item.type))
        );
    }

    // unpack data from API
    const { alerts, kpis } = data["body"];
    const tabs = {
        "Обзор": ["last_activity", "top_categories", "count_by_status"],
        "Тренды": ["weekly_volume"],
        "Производительность": ["time_by_order_type", "time_by_priority"],
        "Исполнители": ["count_by_executor"],
        "Департаменты": ["departments"],
        "Филиалы": ["branches"],
    };

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showCreate={permissions.includes("order:create")}
                showPeriodSelector={true}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], TABLE_PAGES_CONFIG["order"]["resource"], null, false, setRefreshKey, "order")}
                periodProps={[periodFilters, handlePeriodChange]}
            />

            <div className="alerts-container">
                {
                    Object.entries(alerts).map(([type, count]) => (
                        <Alert key={type} type={type.slice(0, type.indexOf("_"))} count={count} />
                    ))
                }
            </div>

            <div className="kpi-container">
                {
                    Object.entries(kpis).map(([title, block]) => (
                        <KPIBlock key={title} title={title} trend_score={block?.formatted || block}
                                  trend_text={block?.trend_text || ""} personal_score={block?.personal}
                        />
                    ))
                }
            </div>

            <div className="tabs-switch">
                {Object.keys(tabs).map((tab, index) => (
                    <p
                        key={index}
                        className={activeTab === index ? "active" : ""}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </p>
                ))}
            </div>

            <div className="stats-container">
                {
                    tabs[Object.keys(tabs)[activeTab]].map((stat, index) => (
                        <StatBlock key={index} title={stat}>
                            {
                                stat === "departments" || stat === "branches" ? (
                                    <DepartmentsStatBlock blocks={data["body"][stat]} />
                                ) : stat === "last_activity" ?
                                    <ActivityBlock activities={data["body"][stat]} />
                                    : stat === "top_categories" ? <CategoriesBlock categories={data["body"][stat]} />
                                        : stat === "count_by_status" ? <StatusPieChart dataFromApi={data["body"][stat]} />
                                            : stat === "weekly_volume" ? <WeeklyVolumeChart dataFromApi={data["body"][stat]} />
                                                : stat === "time_by_priority" ? <TimeGroupsBlock groups={data["body"][stat]} />
                                                    : stat === "time_by_order_type" ? <TimeGroupsBlock groups={data["body"][stat]} />
                                                        : stat === "count_by_executor" ? <ExecutorsBlock dataFromApi={data["body"][stat]} />
                                            : null
                            }
                        </StatBlock>
                    ))
                }
            </div>

            {/* {import.meta.env.DEV && <pre>{JSON.stringify(data, null, 2)}</pre>} */}
        </>
    );
}
