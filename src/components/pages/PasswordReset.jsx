import { useState } from "react";
import AuthContainer from "../layout/auth/AuthContainer";
import AuthInput from "../layout/auth/AuthInput";
// import axios from "../../lib/contexts/axiosInstance";
// import { API_BASE_URL } from "../../lib/constants";


function hide_credentials(credentials, method) {
    if (method === "email") {
        const atIndex = credentials.indexOf('@');
        if (atIndex > 2) {
            return credentials.slice(0, 2) + '***' + credentials.slice(atIndex);
        } else {
            return credentials.slice(0, 1) + '***' + credentials.slice(atIndex);
        }
    } else if (method === "phone") {
        const digitsOnly = credentials.replace(/\D/g, '');
        if (digitsOnly.length < 4) return credentials; // Not enough digits to mask
        return digitsOnly.slice(0, 2) + '***' + digitsOnly.slice(-2);
    }
    return credentials; // Default case, return as is
}


const isValidInput = (input) => {
    const trimmed = input.trim();
    if (trimmed === "") return "";

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(trimmed)) return "";
    if (trimmed.includes('@')) return 'Неверный формат email';

    if (/[^+\d\s]/.test(trimmed)) return 'Недопустимые символы в номере';
    if ((trimmed.match(/\+/g) || []).length > 1) return 'Только один "+" разрешён';
    if (trimmed.includes('+') && !trimmed.startsWith('+')) return '"+ должен быть в начале';

    const digitsOnly = trimmed.replace(/\s/g, '').replace(/^\+/, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 12) return 'Номер должен содержать от 9 до 12 цифр';
    if (trimmed.startsWith("+") && digitsOnly.length < 12) return 'Номер должен содержать 12 цифр, после знака "+"';
    if (digitsOnly.length === 12 && !digitsOnly.startsWith("992")) return 'Номер должен начинаться с 992';

    return "";
};


export default function PasswordReset() {
    const [credentials, setCredentials] = useState("");
    const [error, setError] = useState("");
    const [nextStep, setNextStep] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = isValidInput(credentials);
        setError(validationError);

        if (validationError === "") {
            const method = credentials.includes('@') ? 'email' : 'phone';
            console.log("valid data:", credentials, "method:", method);
            if (method === 'email') {
                setNextStep(true);
            }
            // else if (method === 'phone') {
            // }
        }
    };
    if (nextStep) {
        return (
            <AuthContainer>
                <h2>Проверьте почту</h2>
                <p className="login-link">Проверьте свою электронную почту {hide_credentials(credentials, "email")} для получения ссылки для сброса пароля.</p>
                <a href="/login" className="login-link">Вернуться к входу</a>
            </AuthContainer>
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
