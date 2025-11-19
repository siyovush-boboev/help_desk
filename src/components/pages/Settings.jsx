import { useState, useEffect } from "react";
import Breadcrumbs from "../layout/Breadcrumbs";
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";
import { CopyIcon, TelegramIcon } from "../ui/icons";

const TELEGRAM_BOT_USERNAME = "arvand_support_bot";
const TELEGRAM_BOT_LINK = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
const TELEGRAM_REQUEST_COOLDOWN = 1 * 60 * 1000; // minutes
const LAST_REQUEST_KEY = "telegramLastRequest";


export default function Settings() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cooldownLeft, setCooldownLeft] = useState(0);

    // Check cooldown on mount
    useEffect(() => {
        const last = localStorage.getItem(LAST_REQUEST_KEY);
        if (last) {
            const diff = Date.now() - parseInt(last, 10);
            if (diff < TELEGRAM_REQUEST_COOLDOWN) {
                setCooldownLeft(TELEGRAM_REQUEST_COOLDOWN - diff);
            }
        }
    }, []);

    // Update countdown every second
    useEffect(() => {
        if (cooldownLeft <= 0) return;
        const interval = setInterval(() => {
            setCooldownLeft(prev => (prev > 1000 ? prev - 1000 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldownLeft]);

    const handleConnectTelegram = async () => {
        if (cooldownLeft > 0) return;
        setLoading(true);
        setError("");
        try {
            const response = await axios.post(API_BASE_URL + "/profile/telegram/generate-token");
            const newToken = response?.data?.body?.token;
            if (!newToken) throw new Error("Token missing");
            setToken(newToken);
            localStorage.setItem(LAST_REQUEST_KEY, Date.now().toString());
            setCooldownLeft(TELEGRAM_REQUEST_COOLDOWN);
        } catch (err) {
            console.error(err);
            setError("Ошибка при подключении Telegram. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!token) return;
        try {
            const textarea = document.createElement("textarea");
            textarea.value = token;
            textarea.style.position = "fixed"; // prevent scroll to bottom
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        } catch (err) {
            console.error(err);
        }
    };

    const formatCooldown = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="main-settings-container">
            <Breadcrumbs text="Настройки" />
            <div className="settings-card">

                {!token && (
                    <div>
                        <button
                            onClick={handleConnectTelegram}
                            disabled={loading || cooldownLeft > 0}
                            className="connect-btn"
                        >
                            {loading
                                ? "Загрузка..."
                                : cooldownLeft > 0
                                ? `Попробуйте подключить Telegram через ${formatCooldown(cooldownLeft)}`
                                : <><TelegramIcon />&nbsp;Подключить Telegram</>
                            }
                        </button>
                        {error && <p className="error-text">{error}</p>}
                    </div>
                )}

                {token && (
                    <div className="telegram-section">
                        <p>
                            Перейдите в Telegram-бот{" "}
                            <a
                                href={TELEGRAM_BOT_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bot-link"
                            >
                                @{TELEGRAM_BOT_USERNAME}
                            </a>{" "}
                            и отправьте ему этот код:
                        </p>

                        <div className="token-container" onClick={handleCopy}>
                            <code>{token}</code>
                            <CopyIcon />
                       </div>
                        <small className="copy-hint">Нажмите, чтобы скопировать</small>
                    </div>
                )}
            </div>
        </div>
    );
}
