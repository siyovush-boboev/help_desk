import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../lib/constants";
import { PasswordShow, PasswordHide } from "../ui/icons";
import axios from "../../lib/contexts/axiosInstance";
import { AuthContext } from "../../lib/contexts/authContext";
import AuthInput from "../layout/auth/AuthInput";
import AuthContainer from "../layout/auth/AuthContainer";
import CheckBox from "../layout/auth/CheckBox";


const Login = () => {
    const { setAccessToken, setAuthFailed } = useContext(AuthContext);
    const navigate = useNavigate();

    const passwordRef = useRef(null);
    const [err, setErr] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            const res = await axios.post(API_BASE_URL + "/auth/login", { login: username, password, rememberMe }, { withCredentials: true });
            if (res.status === false) throw new Error("Login failed");
            const data = await res.data.body;
            setAccessToken(data.accessToken);
            setAuthFailed(false);
            navigate("/main");
        } catch (e) {
            setAuthFailed(true);
            passwordRef.current?.focus();
            setErr(e?.response?.data?.message || "Произошла ошибка при входе");
            console.error(e);
        }
    };

    return (
        <AuthContainer header_text={"Войти в личный кабинет"}>
            <form id="login-form" onSubmit={handleLogin}>
                <AuthInput
                    label={"Логин"}
                    name={"login"}
                    placeholder={"Введите ваш логин"}
                    value={username}
                    set_func={setUsername}
                    required={true}
                />

                <AuthInput
                    label={"Пароль"}
                    name={"password"}
                    placeholder={"********"}
                    value={password}
                    set_func={setPassword}
                    type={showPassword ? "text" : "password"}
                    required={true}
                    inputRef={passwordRef}
                >
                    {password && (
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(prev => !prev)}
                            tabIndex={-1}
                        >
                            {showPassword ? <PasswordShow /> : <PasswordHide />}
                        </button>
                    )}
                </AuthInput>

                <div className="login-error">{err}&nbsp;</div>

                <CheckBox id="rememberMe" checked={rememberMe} onChangeFunc={setRememberMe}>
                    Запомнить меня
                </CheckBox>

                <div><a href="#" className="auth-page-link">Забыли пароль?</a></div>
                <button type="submit" className="btn-submit">Войти</button>
            </form>
        </AuthContainer>
    );
};

export default Login;
