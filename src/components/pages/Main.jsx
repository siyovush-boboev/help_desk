import { useEffect, useState, useContext } from "react";
import Breadcrumbs from "../layout/Breadcrumbs";
import ControlBar from "../layout/ControlBar";
import { loadDataPreload, loadDataTable, onCreate } from "../../lib/utils/helpers";
import { TABLE_PAGES_CONFIG, FORM_CONFIG } from "../../lib/pages";
import { ModalContext } from "../../lib/contexts/ModalContext";
import { ExclaimIcon, ClockIcon, ApplicationsDarkIcon, CheckMarkIcon, ShieldIcon, WatchIcon, UsersIcon } from "../ui/icons";


const PAGE_NAME = "main";
const config = TABLE_PAGES_CONFIG[PAGE_NAME];


function Alert( {type, count} ){
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


function KPIBlock( {title, trend_score, trend_text=""}){
    const contents = {
        total_orders: ["Всего заявок", <ApplicationsDarkIcon />],
        open_orders: ["Открытые заявки", <ClockIcon />],
        resolved_orders: ["Решённые заявки", <CheckMarkIcon />],
        sla_compliance: ["Соблюдение SLA", <ShieldIcon />],
        avg_response_time: ["Среднее время ответа", <WatchIcon />],
        avg_resolve_time: ["Среднее время решения", <ClockIcon />],
        fcr_rate: ["Уровень первого контакта", <UsersIcon />],
    };

    const title_ru = contents?.[title]?.[0] || title;

    return (
        <div className="kpi-item">
            <div className="kpi-title">
                <p>{title_ru}</p>
                {contents?.[title]?.[1]}
            </div>
            <div className="kpi-trend">
                <p>{trend_score}</p>
                <p>{trend_text}</p>
            </div>
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
    // console.log("Permissions from main comp:", permissions);

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
            Object.entries(preload[status_field_key]).filter(([, item]) => [1,3].includes(item.type))
        );
    }

    // unpack data from API
    const { alerts, kpis } = data["body"];

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

            <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
    );
}
