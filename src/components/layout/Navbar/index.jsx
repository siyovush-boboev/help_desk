import { HomeIcon, ApplicationsIcon, UsersIcon, ReportsIcon, SettingsIcon, CollectionIcon } from '../../ui/icons.jsx';
import NavbarLink from '../../ui/NavbarLink.jsx';
import { COLLECTION_LINKS, EQUIPMENT_SUBLINKS } from '../../../lib/constants.js';
import { navbarClickHandler } from '../../../lib/utils/helpers.js';

export default function Navbar() {

    return (
        <nav onClick={navbarClickHandler}>
            <NavbarLink icon={HomeIcon} label="Главная" href="/" />
            <NavbarLink icon={ApplicationsIcon} label="Заявки" href="/orders" />
            <NavbarLink icon={UsersIcon} label="Пользователи" href="/users" />

            {/* 📦 Collection Dropdown */}
            <div className="navbar-link dropdown-container">
                <div className="dropdown-toggler">
                    <CollectionIcon />
                    &nbsp;&nbsp;<p>Справочник ▼</p>
                </div>

                {/* Top-level collection links */}
                {COLLECTION_LINKS.map((link) => (
                    <NavbarLink
                        key={link.href}
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
                            key={link.href}
                            label={link.label}
                            href={link.href}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ))}
                </div>
            </div>

            <NavbarLink icon={ReportsIcon} label="Отчеты" href="/reports" />
            <NavbarLink icon={SettingsIcon} label="Настройки" href="/settings" />
        </nav>
    );
}
