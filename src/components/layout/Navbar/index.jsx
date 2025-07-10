import { HomeIcon, ApplicationsIcon, UsersIcon, ReportsIcon, SettingsIcon, CollectionIcon } from '../../ui/icons.jsx';
import NavbarLink from '../../ui/NavbarLink.jsx';
import { navbarClickHandler } from '../../../lib/utils/helpers.js';

export default function Navbar() {
    return (
        <nav onClick={navbarClickHandler}>
            <NavbarLink icon={HomeIcon} label="Главная" href="#home" className="active" />
            <NavbarLink icon={ApplicationsIcon} label="Заявки" href="#applications" />
            <NavbarLink icon={UsersIcon} label="Пользователи" href="#users" />

            <div className="navbar-link dropdown-container">
                <div className="dropdown-toggler">
                    <CollectionIcon />
                    &nbsp;&nbsp;<p>Справочник ▼</p>
                </div>
                <NavbarLink label="Статусы" href="#statuses" />
                <NavbarLink label="Приоритеты" href="#priorities" />
                <NavbarLink label="Департаменты" href="#departments" />
                <NavbarLink label="Отделы" href="#divisions" />
                <NavbarLink label="Филиалы" href="#branches" />
                <NavbarLink label="Офисы ЦБО" href="#cbo-offices" />
                <NavbarLink label="Роли" href="#roles" />
                <NavbarLink label="Привелигии" href="#privileges" />
                <NavbarLink label="Оборудования" href="#equipment" />

                <div className="dropdown-container dropdown-link dropdown-toggler">
                    <div><p>Оборудования ▼</p></div>
                    <NavbarLink label="Банкоматы" href="#atms" />
                    <NavbarLink label="Терминалы" href="#terminals" />
                    <NavbarLink label="POS-терминалы" href="#pos-terminals" />
                    <NavbarLink label="ЦО+ЭО" href="#co-eo" />
                </div>
            </div>

            <NavbarLink icon={ReportsIcon} label="Отчеты" href="#reports" />
            <NavbarLink icon={SettingsIcon} label="Настройки" href="#settings" />
        </nav>
    );
}
