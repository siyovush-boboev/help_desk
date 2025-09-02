import { useState } from "react";
import AuthContainer from "../layout/AuthContainer";
import AuthInput from "../ui/AuthInput";
import { hide_credentials, isValidCredsInput } from "../../lib/utils/helpers";
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";
import ConfirmCode from "./ConfirmCode";


export default function PasswordReset() {
    const [credentials, setCredentials] = useState("");
    const [error, setError] = useState("");
    const [nextStep, setNextStep] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = isValidCredsInput(credentials);
        setError(validationError);

        if (validationError === "" && credentials.length > 0) {
            const method = credentials.includes('@') ? 'email' : 'phone';
            console.log("valid data:", credentials, "method:", method);
            try {
                const res = await axios.post(`${API_BASE_URL}/auth/password/request`, { login: credentials });
                if (res?.status) {
                    setNextStep(method);
                } else {
                    setError(res?.message || "Не удалось отправить код");
                }
            }
            catch {
                setError("Ошибка при отправке запроса. Попробуйте позже.");
            }
        }
    };

    if (nextStep) {
        if (nextStep === "email")
            return (
                <AuthContainer>
                    <h2>Проверьте почту</h2>
                    <p className="login-link">Проверьте свою электронную почту {hide_credentials(credentials, "email")} для получения ссылки для сброса пароля.</p>
                    <a href="/login" className="login-link">Вернуться к входу</a>
                </AuthContainer>
            );
        if (nextStep === "phone")
            return (
                <ConfirmCode login={credentials} />
            );
    }

    return (
        <AuthContainer header_text={"Авторизация"}>

            <form id="auth-form" onSubmit={handleSubmit}>

                <p>Введите свой электронный адрес или номер телефона, и мы отправим вам ссылку для смены пароля.</p>

                <AuthInput
                    name={"creds"}
                    value={credentials}
                    set_func={(val) => {setCredentials(val);setError("");}}
                    placeholder={"Введите ваш email или номер телефона"}
                    required={true}
                />

                <p className="login-error">{error}&nbsp;</p>
                
                <button type="submit" className="btn-submit" disabled={credentials.trim() === ""}>
                    Продолжить
                </button>

            </form>

            <a href="/login" className="login-link">Вернуться к входу</a>

        </AuthContainer>
    );
}
