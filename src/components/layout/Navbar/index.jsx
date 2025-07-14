import { HomeIcon, ApplicationsIcon, UsersIcon, ReportsIcon, SettingsIcon, CollectionIcon } from '../../ui/icons.jsx';
import NavbarLink from '../../ui/NavbarLink.jsx';
import { COLLECTION_LINKS, EQUIPMENT_SUBLINKS } from '../../../lib/constants.js';
import { navbarClickHandler } from '../../../lib/utils/helpers.jsx';

export default function Navbar() {

    return (
        <nav onClick={navbarClickHandler}>
            <NavbarLink icon={HomeIcon} label="Главная" href="/" />
            <NavbarLink icon={ApplicationsIcon} label="Заявки" href="/order" />
            <NavbarLink icon={UsersIcon} label="Пользователи" href="/user" />

            {/* 📦 Collection Dropdown */}
            <div className="navbar-link dropdown-container">
                <div className="dropdown-toggler">
                    <CollectionIcon />
                    &nbsp;&nbsp;<p>Справочник ▼</p>
                </div>

                {/* Top-level collection links */}
                {COLLECTION_LINKS.map((link) => (
                    <NavbarLink
                        key={link.label}
                        label={link.label}
                        href={link.href}
                        onClick={(e) => e.stopPropagation()}
                    />
                ))}

                {/* Equipment sub-dropdown */}
                <div className="dropdown-container dropdown-link dropdown-toggler">
                    <div><p>Оборудования ▼</p></div>
                    {EQUIPMENT_SUBLINKS.map((link) => (
                        <NavbarLink
                            key={link.label}
                            label={link.label}
                            href={link.href}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ))}
                </div>
            </div>

            <NavbarLink icon={ReportsIcon} label="Отчеты" href="/report" />
            <NavbarLink icon={SettingsIcon} label="Настройки" href="/setting" />
        </nav>
    );
}
