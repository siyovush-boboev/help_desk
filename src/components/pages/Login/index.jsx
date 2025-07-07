import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../lib/services/api/authApi";
import { useAuth } from "../../../lib/hooks/useAuth";

export default function Login() {
    const { setAccessToken, setUserRole, setPermissions } = useAuth();
    const [loginField, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login(loginField, password);
            setAccessToken(res.access_token);
            setUserRole(res.role);
            setPermissions(res.permissions);
            navigate("/");
        } catch (err) {
            console.err("Login failed", err);
        }
    };


    return (
        <div className="main-login-container">
            <div className="login-card">
                {/* Left Side (Logo & App name) */}
                <div className="login-left">
                    <img src="src/assets/images/login-logo.png" alt="Company Logo" />
                </div>

                {/* Right Side (Login Form) */}
                <div className="login-right">
                    <h2>Войти в личный кабинет</h2>
                    <form id="login-form" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="login" className="form-label">Логин</label>
                            <input
                                type="text"
                                name="login"
                                className="form-control"
                                id="login"
                                placeholder="Введите ваш логин"
                                value={loginField}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">Пароль</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                id="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <div className="form-check">
                                <label className="form-check-label" htmlFor="rememberMe">Запомнить меня</label>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                            </div>
                            <div>
                                <a href="#" className="auth-page-link">Забыли пароль?</a>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit">Войти</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
