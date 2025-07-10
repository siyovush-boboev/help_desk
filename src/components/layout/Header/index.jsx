export default function Header() {
    return (
        <header>
            <div className="sandwitch">
                <span>☰</span>
            </div>
            <div className="logo">
                <img src="src/assets/images/header-logo.png" alt="Company Logo" />
            </div>
            <div className="user-info">
                <div className="user-info-clickable">
                    <div className="user-text">
                        <h4>initials</h4>
                        <p>position</p>
                    </div>
                    <div className="user-avatar">
                        <img
                            width="30"
                            height="30"
                            src="src/assets/svg/person.svg"
                            alt="User Avatar"
                            className="rounded-circle user-logo"
                        />
                    </div>
                </div>
            </div>
            <div className="modal" style={{ display: "none" }}>
                <div className="modal-content"></div>
            </div>
        </header>
    );
}
