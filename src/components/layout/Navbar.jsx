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

const PAGINATION_URL_PARAMS = "withPagination=true&page=1&limit=20";

const NAVBAR_PAGES = ["main", "order", "user", "report", "setting"];


export default function Navbar() {
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
    console.log("permission from navbar comp:", permissions);

    const MAIN_NAVBAR_LINKS = NAVBAR_PAGES.reduce((acc, key) => {
        acc[key] = {
            icon: ICONS[key] || null,
            label: TABLE_PAGES_CONFIG[key]?.plural || key,
            href: `/${TABLE_PAGES_CONFIG[key]?.resource || ""}` + 
                (!["report", "setting", "main"].includes(key) ? `?${PAGINATION_URL_PARAMS}` : ""),
        };
        return acc;
    }, {});

    MAIN_NAVBAR_LINKS["my_orders"] = {
        ...MAIN_NAVBAR_LINKS["order"],
        label: "Мои заявки",
        href: `${MAIN_NAVBAR_LINKS["order"].href}&participant=me`,
    };

    MAIN_NAVBAR_LINKS["order"].label = "Все заявки";
    
    const collectionPages = Object.entries(TABLE_PAGES_CONFIG).filter(
        ([key]) => !NAVBAR_PAGES.includes(key)
    );
    
    let COLLECTION_LINKS = collectionPages
        .map(([, config]) => ({
            label: config.plural,
            href: config.resource + `?${PAGINATION_URL_PARAMS}`,
        }));

    // filter collection_links, check if user has permission to edit/delete/create items in that collection
    // if not, do not show that link in the navbar
    const filteredCollectionLinks = COLLECTION_LINKS.filter(({ label,  }) => {
        const pageKey = Object.keys(TABLE_PAGES_CONFIG).find(
            key => TABLE_PAGES_CONFIG[key].plural === label
        );
        if (!pageKey) return false;
        const canEdit = permissions.includes(`${pageKey}:update`);
        const canCreate = permissions.includes(`${pageKey}:create`);
        const canDelete = permissions.includes(`${pageKey}:delete`);
        return canEdit || canCreate || canDelete;
    });

    // use filteredCollectionLinks instead of COLLECTION_LINKS
    COLLECTION_LINKS = filteredCollectionLinks;

    return (
        <nav onClick={navbarClickHandler}>
            <NavbarLink {...MAIN_NAVBAR_LINKS["main"]} key="main" />

            {permissions.includes("order:view") && 
                <NavbarLink {...MAIN_NAVBAR_LINKS["my_orders"]} key="order" />
            }

            {permissions.includes("order:view") && 
                <NavbarLink {...MAIN_NAVBAR_LINKS["order"]} key="order" />
            }

            {(permissions.includes("user:update") || permissions.includes("user:create") 
              || permissions.includes("user:delete")) && 
                  <NavbarLink {...MAIN_NAVBAR_LINKS["user"]} key="user" />
            }

            {COLLECTION_LINKS.length > 0 && (
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

                    </div>
            )}

            {permissions.includes("report:view") && 
                <NavbarLink {...MAIN_NAVBAR_LINKS["report"]} key="report" />
            }

            <NavbarLink {...MAIN_NAVBAR_LINKS["setting"]} key="setting" />
        </nav>
    );
}
