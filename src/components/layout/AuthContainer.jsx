import login_logo from '../../assets/images/login-logo.webp';


export default function Login({ children, header_text }) {
    return (
        <div className="main-login-container">
            <div className="login-card">
                {/* Left Side (Logo & App name) */}
                <div className="login-left">
                    <img src={login_logo} alt="Company Logo" />
                </div>

                {/* Right Side (Login Form) */}
                <div className="login-right">
                    <h2>{header_text}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
};