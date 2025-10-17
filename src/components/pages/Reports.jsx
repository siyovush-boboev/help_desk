import Breadcrumbs from "../layout/Breadcrumbs";

export default function Reports() {
    return (
        <div className="main-reports-container">
            <Breadcrumbs text="Отчёты"></Breadcrumbs>
            <div className="reports-card">
                <p>Здесь будет список отчетов.</p>
                {/* Add your reports content here */}
            </div>
        </div>
    );
}


/*


filters:
    period date_from date_to
    event_type
    user_ids


buttons

table



for now just put a download button

*/
