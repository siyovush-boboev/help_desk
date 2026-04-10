import { useState, useEffect } from "react";
import Breadcrumbs from "../layout/Breadcrumbs";
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";
import { CopyIcon, TelegramIcon } from "../ui/icons";
import QRCode from "react-qr-code";

const TELEGRAM_BOT_USERNAME = "arvand_support_bot";
const TELEGRAM_BOT_LINK = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
const TELEGRAM_REQUEST_COOLDOWN = 1 * 60 * 1000; // minutes
const LAST_REQUEST_KEY = "telegramLastRequest";


export default function Settings() {
    const [telegramStatus, setTelegramStatus] = useState({ enabled: false, linked: false });
    const [tokenData, setTokenData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unlinking, setUnlinking] = useState(false);
    const [error, setError] = useState("");
    const [cooldownLeft, setCooldownLeft] = useState(0);

    // Check telegram status on mount
    useEffect(() => {
        fetchTelegramStatus();
    }, []);

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

    // Poll telegram status while connecting (every 5 seconds)
    useEffect(() => {
        if (!tokenData || telegramStatus.linked) return;

        const pollInterval = setInterval(async () => {
            // Check if code has expired
            const now = Date.now() / 1000;
            const tokenGenerated = localStorage.getItem(LAST_REQUEST_KEY);
            if (tokenGenerated) {
                const generatedTime = parseInt(tokenGenerated, 10) / 1000;
                const elapsed = now - generatedTime;
                if (elapsed >= tokenData.expires_in_seconds) {
                    // Code expired, stop polling and clear token
                    setTokenData(null);
                    return;
                }
            }

            // Check connection status
            try {
                const response = await axios.get(API_BASE_URL + "/profile/telegram");
                const data = response?.data?.body;
                if (data?.linked) {
                    setTelegramStatus({ enabled: data.enabled || false, linked: true });
                    setTokenData(null); // Clear the token data since they're now connected
                }
            } catch (err) {
                console.error("Failed to poll telegram status:", err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, [tokenData, telegramStatus.linked]);

    const fetchTelegramStatus = async () => {
        try {
            const response = await axios.get(API_BASE_URL + "/profile/telegram");
            const data = response?.data?.body;
            if (data) {
                setTelegramStatus({ enabled: data.enabled || false, linked: data.linked || false });
            }
        } catch (err) {
            console.error("Failed to fetch telegram status:", err);
        }
    };

    const handleConnectTelegram = async () => {
        if (cooldownLeft > 0) return;
        setLoading(true);
        setError("");
        try {
            const response = await axios.post(API_BASE_URL + "/profile/telegram/generate-token");
            console.log("Full response:", response);
            console.log("Response body:", response?.data?.body);
            const data = response?.data?.body;
            if (!data?.bot_link || !data?.short_code) throw new Error("Invalid response");
            setTokenData(data);
            localStorage.setItem(LAST_REQUEST_KEY, Date.now().toString());
            setCooldownLeft(TELEGRAM_REQUEST_COOLDOWN);
        } catch (err) {
            console.error(err);
            setError("Ошибка при подключении Telegram. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkTelegram = async () => {
        setUnlinking(true);
        setError("");
        try {
            await axios.delete(API_BASE_URL + "/profile/telegram");
            setTelegramStatus(prev => ({ ...prev, linked: false }));
            setTokenData(null);
        } catch (err) {
            console.error(err);
            setError("Ошибка при отключении Telegram. Попробуйте позже.");
        } finally {
            setUnlinking(false);
        }
    };

    const handleCopy = (text) => {
        if (!text) return;
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
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

    const formatExpiration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(`${hours} ${hours === 1 ? "час" : hours < 5 ? "часа" : "часов"}`);
        if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "минута" : minutes < 5 ? "минуты" : "минут"}`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} ${secs === 1 ? "секунда" : secs < 5 ? "секунды" : "секунд"}`);
        
        return parts.join(" ");
    };

    // Don't show telegram section if not enabled
    if (!telegramStatus.enabled) {
        return (
            <div className="main-settings-container">
                <Breadcrumbs text="Настройки" />
                <div className="settings-card">
                    <p>Настройки Telegram недоступны.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-settings-container">
            <Breadcrumbs text="Настройки" />
            <div className="settings-card">

                {telegramStatus.linked ? (
                    <div className="telegram-section">
                        <p>Telegram аккаунт привязан</p>
                        <button
                            onClick={handleUnlinkTelegram}
                            disabled={unlinking}
                            className="disconnect-btn"
                        >
                            {unlinking ? "Загрузка..." : "Отключить Telegram"}
                        </button>
                    </div>
                ) : !tokenData ? (
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
                                    : <><TelegramIcon />&nbsp;Привязать Telegram</>
                            }
                        </button>
                        {error && <p className="error-text">{error}</p>}
                    </div>
                ) : (
                    <div className="telegram-section">
                        <p>
                            Для подключения Telegram используйте один из способов:
                        </p>

                        <div className="telegram-connect-options">
                            <div className="telegram-link-section">
                                <p><strong>Перейти по ссылке:</strong></p>
                                <a
                                    href={tokenData.bot_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="connect-btn telegram-link-btn"
                                >
                                    Открыть Telegram
                                </a>
                                <div className="qr-placeholder">
                                    <p>QR-код:</p>
                                    <QRCode value={tokenData.bot_link} size={128} />
                                </div>
                            </div>

                            <div className="telegram-code-section">
                                <p><strong>Или отправьте код боту:</strong></p>
                                <div className="token-container" onClick={() => handleCopy(tokenData.short_code)}>
                                    <code>{tokenData.short_code}</code>
                                    <CopyIcon />
                                </div>
                                <small className="copy-hint">Нажмите, чтобы скопировать код</small>
                            </div>
                        </div>

                        <p className="expiration-notice">
                            Код действителен в течение {formatExpiration(tokenData.expires_in_seconds)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
