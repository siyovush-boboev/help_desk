import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../lib/constants";

import axios from "../../lib/contexts/axiosInstance";
import { AuthContext } from "../../lib/contexts/authContext";


const Login = () => {
    const { setAccessToken, setAuthFailed } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [err, setErr] = useState("");
    const passwordRef = useRef(null);


    const handleLogin = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            const res = await axios.post(API_BASE_URL + "/auth/login", { login: username, password, rememberMe }, { withCredentials: true });
            if (res.statusText !== "OK") throw new Error("Login failed");
            const data = await res.data.body;
            setAccessToken(data.access_token);
            setAuthFailed(false);
            navigate("/main");
        } catch (e) {
            setAuthFailed(true);
            passwordRef.current?.focus();
            if (e.code === "ERR_NETWORK")
                setErr("Не удается подключиться к серверу");
            else if (e.code === "ERR_BAD_REQUEST")
                setErr("Неверный логин или пароль");
            else
                setErr("Произошла ошибка при входе");
            console.error(e);
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
                                ref={passwordRef}
                            />
                        </div>
                        <div className="login-error">{err}&nbsp;</div>

                        <div>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="rememberMe">Запомнить меня</label>
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
};

export default Login;
