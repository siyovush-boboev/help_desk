import Breadcrumbs from "../../layout/Breadcrumbs";

export default function Settings() {
    return (
        <div className="main-settings-container">
            <Breadcrumbs text="Настройки"></Breadcrumbs>
            <div className="settings-card">
                <p>Здесь будет форма для настройки параметров приложения.</p>
                {/* Add your settings content here */}
            </div>
        </div>
    );
}