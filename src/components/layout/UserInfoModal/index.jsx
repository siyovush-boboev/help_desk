import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../lib/constants";
import { TABLE_PAGES_CONFIG } from "../../../lib/pages";

export default function UserInfoModal({ userId, onClose, departments }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = `${API_BASE_URL}/${TABLE_PAGES_CONFIG["user"]["resource"]}/${userId}`;
                const res = await fetch(url);
                const data = await res.json();
                setUserData(data["result"]);
            } catch (err) {
                console.error("Failed to load user data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <div className="user-info-modal-content">
                <button className="user-info-close-button" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <line x1="4" y1="4" x2="16" y2="16" stroke="white" strokeWidth="2" />
                        <line x1="16" y1="4" x2="4" y2="16" stroke="white" strokeWidth="2" />
                    </svg>
                </button>
                <div className="user-info-main-container">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="user-info-modal-content">
                <button className="user-info-close-button" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <line x1="4" y1="4" x2="16" y2="16" stroke="white" strokeWidth="2" />
                        <line x1="16" y1="4" x2="4" y2="16" stroke="white" strokeWidth="2" />
                    </svg>
                </button>
                <div className="user-info-main-container">
                    <p>Не удалось загрузить информацию о пользователе</p>
                </div>
            </div>
        );
    }

    const [lastName, firstName, middleName] = userData.fio.split(" ");
    const departmentName = departments[userData.department_id] || userData.department_id;

    const infoBlocks = [
        { id: "last_name", label: "Фамилия", value: lastName },
        { id: "first_name", label: "Имя", value: firstName },
        { id: "middle_name", label: "Отчество", value: middleName },
        { id: "email", label: "E-mail", value: userData.email },
        { id: "phone", label: "Телефон", value: userData.phoneNumber },
        { id: "position", label: "Должность", value: userData.position },
        { id: "department", label: "Департамент", value: departmentName },
    ];

    return (
        <div className="user-info-modal-content">
            <button className="user-info-close-button" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                    <line x1="4" y1="4" x2="16" y2="16" stroke="white" strokeWidth="2" />
                    <line x1="16" y1="4" x2="4" y2="16" stroke="white" strokeWidth="2" />
                </svg>
            </button>
            <div className="user-info-main-container">
                <p>Контактная информация</p>

                <div className="user-info-main-content">
                    <div className="user-full-size-pic">
                        <img
                            src={userData.avatar || "userPic"}
                            alt="User avatar"
                        />
                    </div>
                    <div className="user-text-info">
                        {infoBlocks.map((b) => (
                            <div key={b.id}>
                                <label htmlFor={b.id}>{b.label}</label>
                                <p id={b.id}>{b.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
