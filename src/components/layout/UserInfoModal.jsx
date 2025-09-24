import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../lib/contexts/authContext";

import { BASE_URL, API_BASE_URL } from "../../lib/constants";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";
import { UserInfoCloseIcon } from "../ui/icons";
import axios from "../../lib/contexts/axiosInstance";


export default function UserInfoModal({ userId, onClose, departments, data = null }) {
    const [userData, setUserData] = useState(data);
    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = `${API_BASE_URL}/${TABLE_PAGES_CONFIG["user"]["resource"]}/${userId}`;
                const res = await axios.get(url);
                const data = res.data;
                setUserData(data["body"]);
            } catch (err) {
                console.error("Failed to load user data:", err);
            } finally {
                setLoading(false);
            }
        };
        if (!data)  // Only fetch if data is not preloaded
            fetchUser();
        else
            setLoading(false);
    }, [userId, data]);

    const handleLogout = async () => {
        setLogoutLoading(true);
        await logout();
        localStorage.setItem("user_id", null);
        localStorage.setItem("user_role", null);
        localStorage.setItem("permissions", null);
        localStorage.setItem("user_department_id", null);
        setLogoutLoading(false);
        onClose();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="user-info-modal-content">
                <button className="user-info-close-button" onClick={onClose}>
                    <UserInfoCloseIcon></UserInfoCloseIcon>
                </button>
                <div className="user-info-main-container">
                    <div className="loader-black"></div>
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
    const departmentName = departments?.[userData.department_id]["name"] || userData.department_id;

    const infoBlocks = [
        { id: "last_name", label: "Фамилия", value: lastName },
        { id: "first_name", label: "Имя", value: firstName },
        { id: "middle_name", label: "Отчество", value: middleName },
        { id: "email", label: "E-mail", value: userData.email },
        { id: "phone", label: "Телефон", value: userData.phone_number },
        { id: "position", label: "Должность", value: userData.position },
        { id: "department", label: "Департамент", value: departmentName },
    ];
    if (data){
        infoBlocks.push({ id: "role", label: "Роль", value: localStorage.getItem("user_role")?.replace(/"/g, "") || "" });
    }

    return (
        <div className="user-info-modal-content">
            <button className="user-info-close-button" onClick={onClose}>
                <UserInfoCloseIcon />
            </button>
            <div className="user-info-main-container">
                <p>Контактная информация</p>

                <div className="user-info-main-content">
                    <div className="user-full-size-pic">
                        {userData.photo_url && 
                        <img
                            src={BASE_URL + userData.photo_url}
                            alt=""
                        />
                        }
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

                {data && (logoutLoading ? <div className="loader-black" style={{margin: "auto auto 0 auto"}}></div>
                               : <button className="btn-logout" onClick={handleLogout}>Выйти</button>)}
            </div>
        </div>
    );
}
