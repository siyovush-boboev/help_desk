import { HomeIcon, ApplicationsIcon, UsersIcon, ReportsIcon, SettingsIcon, CollectionIcon } from '../icons.jsx';


export default function Navbar() {
    return (
        <nav>
            <div className="navbar-link">
                <HomeIcon></HomeIcon>
                &nbsp;&nbsp;<a href="#main">Главная</a>
            </div>

            <div className="navbar-link">
                <ApplicationsIcon></ApplicationsIcon>
                &nbsp;&nbsp;<a href="#applications">Заявки</a>
            </div>

            <div className="navbar-link">
                <UsersIcon></UsersIcon>
                &nbsp;&nbsp;<a href="#users">Пользователи</a>
            </div>

            <div className="navbar-link dropdown-container">
                <div className="dropdown-toggler">
                    <CollectionIcon></CollectionIcon>
                    &nbsp;&nbsp;<p>Справочник ▼</p>
                </div>
                <a href="#statuses" className="dropdown-link">Статусы</a>
                <a href="#priorities" className="dropdown-link">Приоритеты</a>
                <a href="#departments" className="dropdown-link">Департаменты</a>
                <a href="#divisions" className="dropdown-link">Отделы</a>
                <a href="#branches" className="dropdown-link">Филиалы</a>
                <a href="#cbo-offices" className="dropdown-link">Офисы ЦБО</a>
                <a href="#roles" className="dropdown-link">Роли</a>
                <a href="#privileges" className="dropdown-link">Привелигии</a>
                <a href="#equipment" className="dropdown-link">Оборудования</a>

                <div className="dropdown-container2 dropdown-link dropdown-toggler">
                    <div><p>Оборудования ▼</p></div>
                    <a href="#atms" className="dropdown-link2">Банкоматы</a>
                    <a href="#terminals" className="dropdown-link2">Терминалы</a>
                    <a href="#pos-terminals" className="dropdown-link2">POS-терминалы</a>
                    <a href="#co-eo" className="dropdown-link2">ЦО+ЭО</a>
                </div>
            </div>

            <div className="navbar-link">
                <ReportsIcon></ReportsIcon>
                &nbsp;&nbsp;<a href="#reports">Отчеты</a>
            </div>

            <div className="navbar-link">
                <SettingsIcon></SettingsIcon>
                &nbsp;&nbsp;<a href="#settings">Настройки</a>
            </div>
        </nav>
    );
}
