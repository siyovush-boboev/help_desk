import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthInput from "../ui/AuthInput";
import AuthContainer from "../layout/AuthContainer";
import axios from "../../lib/contexts/axiosInstance";
import { validate_confirmation, isValidCredsInput } from "../../lib/utils/helpers";
import { API_BASE_URL } from "../../lib/constants";
import { PasswordShow, PasswordHide } from "../ui/icons";

export default function PasswordChange() {
    const [searchParams] = useSearchParams();
    const login = searchParams.get("login");
    const confirmation = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const passwordRef = useRef(null);

    if (!(confirmation || login)) {
        navigate("/login");
    }

    if (!validate_confirmation(confirmation) || !login || isValidCredsInput(login)) {
        return (
            <AuthContainer header_text={"Смена пароля"}>
                <p style={{ textAlign: "center" }}>Неправильный логин, токен или код подтверждения.</p>
                <a href="/login" className="login-link">Вернуться к входу</a>
            </AuthContainer>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        if (!password || !passwordConfirm) {
            setErr("Введите новый пароль и подтвердите его.");
            return;
        }

        if (password !== passwordConfirm) {
            setErr("Пароли не совпадают.");
            return;
        }

        if (password.length < 6) {
            setErr("Пароль должен содержать не менее 6 символов.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/auth/password/reset`, {
                token: confirmation,
                new_password: password,
            });

            if (res.status === 200) {
                navigate("/login");
            } else {
                setErr("Ошибка при смене пароля.");
            }
        } catch (error) {
            setErr(error?.response?.data?.message || "Ошибка при смене пароля.");
            passwordRef.current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const renderToggleBtn = () => (
        <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(prev => !prev)}
            tabIndex={-1}
        >
            {showPassword ? <PasswordShow /> : <PasswordHide />}
        </button>
    );

    return (
        <AuthContainer header_text={"Смена пароля"}>
            <form id="auth-form" onSubmit={handleSubmit}>
                <AuthInput
                    label={"Новый пароль"}
                    name={"password"}
                    placeholder={"Введите новый пароль"}
                    value={password}
                    set_func={setPassword}
                    type={showPassword ? "text" : "password"}
                    required={true}
                    inputRef={passwordRef}
                >
                    {(password || passwordConfirm) && renderToggleBtn()}
                </AuthInput>

                <AuthInput
                    label={"Подтвердите пароль"}
                    name={"passwordConfirm"}
                    placeholder={"Повторите новый пароль"}
                    value={passwordConfirm}
                    set_func={setPasswordConfirm}
                    type={showPassword ? "text" : "password"}
                    required={true}
                >
                    {(password || passwordConfirm) && renderToggleBtn()}
                </AuthInput>

                <div className="login-error" style={{ marginBottom: 10 }}>{err}&nbsp;</div>

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={loading || !password || !passwordConfirm}
                >
                    {loading ? <div className="loader-white" /> : "Сменить пароль"}
                </button>
            </form>
        </AuthContainer>
    );
}
