import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../lib/constants";

import axios from "../../lib/contexts/axiosInstance"; // import your axios instance
import { AuthContext } from "../../lib/contexts/authContext";


const Login = () => {
    const { setAccessToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [err, setErr] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault(); // ✅ move this up so it works properly
        setErr("");

        try {
            const res = await axios.post(API_BASE_URL + "/auth/login", { login: username, password, rememberMe }, { withCredentials: true });

            if (res.statusText !== "OK") throw new Error("Login failed");

            const data = await res.data; // { access_token: "..." }
            setAccessToken(data.access_token); // update context
            navigate("/main"); // ✅ go to dashboard or whatever
        } catch (e) {
            setErr("Login failed. Check creds bruh");
            console.error(e); // log exact err
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
                    <form id="login-form" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="login" className="form-label">Логин</label>
                            <input
                                type="text"
                                name="login"
                                className="form-control"
                                id="login"
                                placeholder="Введите ваш логин"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                                minLength={6}
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
            {err && <div style={{ color: 'red' }}>{err}</div>}
        </div>
    );
};

export default Login;
