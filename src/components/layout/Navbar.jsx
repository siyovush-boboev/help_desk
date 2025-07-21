import { HomeIcon, ApplicationsIcon, UsersIcon, ReportsIcon, SettingsIcon, CollectionIcon } from '../ui/icons.jsx';
import { navbarClickHandler } from '../../lib/utils/helpers.jsx';
import { TABLE_PAGES_CONFIG } from '../../lib/pages.js';
import NavbarLink from '../ui/NavbarLink.jsx';


const ICONS = {
    "main": HomeIcon,
    "order": ApplicationsIcon,
    "user": UsersIcon,
    "report": ReportsIcon,
    "setting": SettingsIcon,
};

const NAVBAR_PAGES = ["main", "order", "user", "report", "setting"];

const MAIN_NAVBAR_LINKS = NAVBAR_PAGES.reduce((acc, key) => {
    acc[key] = {
        icon: ICONS[key] || null,
        label: TABLE_PAGES_CONFIG[key]?.plural || key,
        href: `/${TABLE_PAGES_CONFIG[key]?.resource || ""}`,
    };
    return acc;
}, {});

const collectionPages = Object.entries(TABLE_PAGES_CONFIG).filter(
    ([key]) => !NAVBAR_PAGES.includes(key)
);

const COLLECTION_LINKS = collectionPages
    .filter(([key]) => key !== "atm" && key !== "terminal" && key !== "pos" && key !== "coeo")
    .map(([, config]) => ({
        label: config.plural,
        href: config.resource,
    }));

const EQUIPMENT_SUBLINKS = ["atm", "terminal", "pos", "coeo"]
    .filter((key) => TABLE_PAGES_CONFIG[key])
    .map((key) => ({
        label: TABLE_PAGES_CONFIG[key].plural,
        href: TABLE_PAGES_CONFIG[key].resource,
    }));


export default function Navbar() {
    return (
        <nav onClick={navbarClickHandler}>
            <NavbarLink {...MAIN_NAVBAR_LINKS["main"]} key="main" />
            <NavbarLink {...MAIN_NAVBAR_LINKS["order"]} key="order" />
            <NavbarLink {...MAIN_NAVBAR_LINKS["user"]} key="user" />

            {/* 📦 Collection Dropdown */}
            <div className="navbar-link dropdown-container">
                <div className="dropdown-toggler">
                    <CollectionIcon />
                    &nbsp;&nbsp;<p>Справочник ▼</p>
                </div>

                {COLLECTION_LINKS.map(({ label, href }) => (
                    <NavbarLink
                        key={label}
                        label={label}
                        href={href}
                    />
                ))}

                {/* Equipment sub-dropdown */}
                <div className="dropdown-container dropdown-link dropdown-toggler">
                    <div><p>Оборудования ▼</p></div>
                    {EQUIPMENT_SUBLINKS.map(({ label, href }) => (
                        <NavbarLink
                            key={label}
                            label={label}
                            href={href}
                        />
                    ))}
                </div>
            </div>

            <NavbarLink {...MAIN_NAVBAR_LINKS["report"]} key="report" />
            <NavbarLink {...MAIN_NAVBAR_LINKS["setting"]} key="setting" />
        </nav>
    );
}
