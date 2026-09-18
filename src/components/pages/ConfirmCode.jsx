import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import AuthContainer from "../layout/AuthContainer";
import { hide_credentials } from "../../lib/utils/helpers";
import axios from "../../lib/contexts/axiosInstance";



const CODE_LENGTH = 6;

export default function ConfirmCode({ login }) {
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
    const inputsRef = useRef([]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (resendTimer === 0) {
            setCanResend(true);
            return;
        }
        const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timerId);
    }, [resendTimer]);

    const handleChange = (e, idx) => {
        const val = e.target.value;
        if (!/^\d?$/.test(val)) return;

        const newCode = [...code];
        newCode[idx] = val;
        setCode(newCode);

        if (val && idx < CODE_LENGTH - 1) inputsRef.current[idx + 1].focus();
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && !code[idx] && idx > 0) {
            inputsRef.current[idx - 1].focus();
        }
    };

    const codeStr = code.join("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!/^\d{6}$/.test(codeStr)) return setError("Введите полный шестизначный код");

        setLoading(true);
        try {
            const res = await axios.post("/auth/password/verify_phone", { login, code: codeStr }, { withCredentials: true });
            if (res.data?.status) {
                navigate(`/password-change?login=${encodeURIComponent(login)}&token=${encodeURIComponent(res.data.body.verification_token)}`);
            } else {
                setError("Ошибка подтверждения кода");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Не удалось отправить запрос. Попробуйте позже или проверьте подключение к интернету");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setError("");
        setLoading(true);
        try {
            const res = await axios.post("/auth/password/request", { login });
            if (res?.status) {
                setResendTimer(60);
                setCanResend(false);
                setCode(Array(CODE_LENGTH).fill(""));
                inputsRef.current[0].focus();
            } else {
                setError(res?.response?.data?.message || "Не удалось отправить код");
            }
        } catch (err) {
            setError(err.response.data.message || "Не удалось отправить запрос. Попробуйте позже или проверьте подключение к интернету");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer header_text={"Подтвердите код"}>
            <p>
                Введите шестизначный код из Telegram, который мы отправили на ваш номер телефона {hide_credentials(login, "phone")}.
            </p>

            <form onSubmit={handleSubmit} id="auth-form">
                <div className="input-code-container">
                    {code.map((digit, idx) => (
                        <input
                            key={idx}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            ref={(el) => (inputsRef.current[idx] = el)}
                            className="input-code"
                            autoFocus={idx === 0}
                            disabled={loading}
                        />
                    ))}
                </div>

                <p className="login-error">{error}&nbsp;</p>

                <button
                    type="submit"
                    disabled={codeStr.length < CODE_LENGTH || loading}
                    className="btn-submit"
                >
                    {loading ? <div className="loader-white" /> : "Продолжить"}
                </button>
            </form>

            <p className="resend-timer">
                {canResend ? (
                    <span
                        onClick={handleResend}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleResend()}
                        className="resend-code"
                    >
                        Отправить код заново
                    </span>
                ) : (
                    <>Повторно можно будет отправить через {resendTimer}с</>
                )}
            </p>
            <a href="/login" className="login-link">Вернуться к входу</a>
        </AuthContainer>
    );
}
