import { useEffect, useState, useContext } from "react";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import { loadDataPreload, loadDataTable, onCreate } from "../../lib/utils/helpers";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages";
import { ModalContext } from "../../lib/contexts/ModalContext";
import { ExclaimIcon, ClockIcon, ApplicationsDarkIcon, CheckMarkIcon, ShieldIcon, WatchIcon, UsersDarkIcon, ThunderIcon, ArrowUpIcon, ArrowDownIcon } from "../ui/icons";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";


const PAGE_NAME = "main";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];
const COLORS = [
    "#4285F4",
    "#34A853",
    "#FBBC05",
    "#EA4335",
    "#A142F4",
    "#F44292",
    "#2BB7DA",
    "#9AA0A6",
];


function StatusPieChart({ dataFromApi }) {
    if (!dataFromApi || dataFromApi.length === 0) return null;

    const total = dataFromApi.reduce((sum, item) => sum + item.count, 0);

    const dataWithPercent = dataFromApi.map((item) => ({
        ...item,
        percent: ((item.count / total) * 100).toFixed(1),
    }));

    return (
        <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <PieChart>
                    <Pie
                        data={dataWithPercent}
                        dataKey="count"
                        nameKey="group_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, percent }) => `${name}: ${(
                            percent
                        )}%`} // labels inside slices
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
    );
}

function StatBlock({ title, children }) {
    const contents = {
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


function KPIBlock({ title, trend_score, trend_text = "" }) {
    const contents = {
        total_orders: ["Всего заявок", <ApplicationsDarkIcon />],
        open_orders: ["Открытые заявки", <ClockIcon />],
        resolved_orders: ["Решённые заявки", <CheckMarkIcon />],
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
                <p>
                    {trend_text.startsWith("+") ? <ArrowUpIcon /> : trend_text.startsWith("-") ? <ArrowDownIcon /> : null}
                    &nbsp;
                    {trend_text}
                </p>
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
        <div className="categories-container">
            {
                categories?.map((category, index) => (
                    <div key={index} className="category-item">
                        <p>{category.group_name}</p>
                        <code>{category.count}</code>
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

    useEffect(() => {
        loadDataPreload(setPreload, setError, TABLE_PAGES_CONFIG, config)
            .then(() => setPreloadLoaded(true));
    }, []);

    useEffect(() => {
        loadDataTable(setData, setLoading, setError, config);
    }, [refreshKey]);

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
        "Департаменты": ["departments"],
        "Филиалы": ["branches"],
        // "Тренды": [],
        // "Производительность": [],
    };

    return (
        <>
            <Breadcrumbs text={config.plural} />

            <ControlBar
                showCreate={permissions.includes("order:create")}
                onCreate={() => onCreate(setModalContent, closeModal, preload, FORM_CONFIG[PAGE_NAME], TABLE_PAGES_CONFIG["order"]["resource"], null, false, setRefreshKey, PAGE_NAME)}
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
                        <KPIBlock key={title} title={title} trend_score={block?.formatted || block} trend_text={block?.trend_text || ""} />
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
                                            : null
                            }
                        </StatBlock>
                    ))
                }
            </div>

            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        </>
    );
}
