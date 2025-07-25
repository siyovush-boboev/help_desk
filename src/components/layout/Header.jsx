export default function Header() {
    return (
        <header>
            <div className="sandwitch" onClick={() => {
                const nav = document.querySelector('nav');
                nav.style.left = nav.style.left === '0px' ? '-1000px' : '0px';
            }}>
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
        </header>
    );
}
