import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../lib/contexts/authContext";

import { BASE_URL, API_BASE_URL } from "../../lib/constants";
import { TABLE_PAGES_CONFIG } from "../../lib/pages";
import { UserInfoCloseIcon } from "../ui/icons";
import axios from "../../lib/contexts/axiosInstance";
import { isValidCredsInput, capitalizeName } from "../../lib/utils/helpers";
import { set } from "zod";

export default function UserInfoModal({ userId, onClose, data = null, details_state = null }) {
    const [userData, setUserData] = useState(data);
    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef();

    let initialLastName = "";
    let initialFirstName = "";
    let initialMiddleName = "";
    let initialEmail = "";
    let initialPhoneNumber = "";

    if (data || userData) {
        const fioParts = (userData?.fio || "").split(" ");
        if (fioParts.length >= 3) {
            initialLastName = fioParts[0];
            initialFirstName = fioParts[1];
            initialMiddleName = fioParts[2];
        } else if (fioParts.length === 2) {
            initialLastName = fioParts[0];
            initialFirstName = fioParts[1];
        } else if (fioParts.length === 1) {
            initialFirstName = fioParts[0];
        }
        initialEmail = userData?.email || "";
        initialPhoneNumber = userData?.phone_number || "";
    }

    const [editedFields, setEditedFields] = useState({
        last_name: initialLastName,
        first_name: initialFirstName,
        middle_name: initialMiddleName,
        email: initialEmail,
        phone_number: initialPhoneNumber
    });

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
        if (!data) fetchUser();
        else setLoading(false);
    }, [userId, data]);

    const handleLogout = async () => {
        setLogoutLoading(true);
        await logout();
        localStorage.setItem("user_id", null);
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
                    <UserInfoCloseIcon />
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

    const infoBlocks = [
        { id: "last_name", label: "Фамилия", value: initialLastName || "-" },
        { id: "first_name", label: "Имя", value: initialFirstName || "-" },
        { id: "middle_name", label: "Отчество", value: initialMiddleName || "-" },
        { id: "email", label: "E-mail", value: userData.email || "-" },
        { id: "phone_number", label: "Телефон", value: userData.phone_number || "-" },
        { id: "position", label: "Должность", value: userData.position_name || "-" },
        { id: "department", label: "Департамент", value: userData.department_name || "-" },
        { id: "otdel", label: "Отдел", value: userData.otdel_name || "-" },
        { id: "branch", label: "Филиал", value: userData.branch_short_name || userData.branch_name || "-" },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setError(null);
        editedFields.fio = capitalizeName([editedFields.last_name, editedFields.first_name, editedFields.middle_name].join(" "));
        const { fio, email, phone_number } = editedFields;
        if (!(editedFields.first_name || editedFields.last_name || editedFields.middle_name)) {
            setError("Введите ФИО");
            return;
        }
        const email_error = isValidCredsInput(email, "email", false);
        if (email_error) {
            setError(email_error);
            return;
        }
        const phone_error = isValidCredsInput(phone_number, "phone", false);
        if (phone_error) {
            setError(phone_error);
            return;
        }
        // iterate and add only changed fields
        const changedFields = {};
        for (const [key, value] of Object.entries(editedFields)) {
            if (["last_name", "first_name", "middle_name"].includes(key)) {
                continue;
            } else if (value !== userData[key]) {
                changedFields[key] = value;
            }
        }
        // if (Object.keys(changedFields).length === 0 || (selectedFile === null && userData.photo_url)) {
        //     setEditMode(false);
        //     return;
        // }
        console.log(userData.photo_url, selectedFile, changedFields);
        const formData = new FormData();
        const data2send = {};
        for (const [key, value] of Object.entries(changedFields)) {
            data2send[key] = value;
        }

        if (selectedFile === null) {
            data2send["photo_url"] = null;
        } else {
            formData.append("photoFile", selectedFile);
        }

        if (Object.keys(data2send).length > 0) {
            formData.append("data", JSON.stringify(data2send));
        }
        try {
            const url = `${API_BASE_URL}/auth/me`;
            setLogoutLoading(true);
            await axios.put(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setUserData({
                ...userData,
                fio,
                email,
                phone_number,
                photo_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
            });
            const [userDetails, setUserDetails] = details_state;
            setUserDetails({
                ...userDetails,
                fio,
                email,
                phone_number,
                photo_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
            });
            setEditMode(false);
        } catch (err) {
            console.error("Ошибка при обновлении данных:", err);
            setError(err?.response?.data?.message || err.message || "Не удалось обновить данные. Попробуйте позже.");
        } finally {
            setLogoutLoading(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setEditedFields({
            last_name: initialLastName,
            first_name: initialFirstName,
            middle_name: initialMiddleName,
            email: userData.email,
            phone_number: userData.phone_number
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        setError(null);
        if (userData.photo_url) {
            document.querySelector(".user-full-size-pic img").src = userData.photo_url;
        }
    };

    const handleDeletePhoto = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
        document.querySelector(".user-full-size-pic img").src = "";
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    return (
        <div className="user-info-modal-content">
            <button className="user-info-close-button" onClick={onClose}>
                <UserInfoCloseIcon />
            </button>
            <div className="user-info-main-container">
                <p>Контактная информация</p>

                <div className="user-info-main-content">
                    <div className="user-full-size-pic">
                        {(userData.photo_url || selectedFile) &&
                            <img
                                src={selectedFile ? URL.createObjectURL(selectedFile) : userData.photo_url}
                                alt=""
                            />
                        }
                        <div className="profile-pic-update-buttons">
                            {editMode && (
                                <button 
                                    className="btn-upload-photo btn-cancel"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {fileInputRef.current.value || userData.photo_url ? "Изменить" : "Загрузить"}
                                </button>
                            )}
                            {editMode && userData.photo_url && (
                                <button
                                    className="btn-delete-photo btn-cancel" 
                                    onClick={handleDeletePhoto}
                                >
                                    Удалить
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={ (e) => { handleFileChange(e); } }
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <form className="user-text-info" id="edit-user-form">
                        {infoBlocks.map((b) => {
                            const editable = ["last_name", "first_name", "middle_name", "email", "phone_number"].includes(b.id);
                            return (
                                <div key={b.id}>
                                    <label htmlFor={b.id}>{b.label}</label>
                                    {editMode && editable ? (
                                        <input
                                            id={b.id}
                                            name={b.id}
                                            value={editedFields[b.id]}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p id={b.id}>{editedFields[b.id] || b.value}</p>
                                    )}
                                </div>
                            );
                        })}
                    </form>
                </div>

                {data && (
                    <>
                        <p className="login-error">{error}&nbsp;</p>
                        <div className="user-info-buttons">
                            {logoutLoading ? (
                                <div className="loader-black"></div>
                            ) : (
                                <>
                                    {editMode ? (
                                        <>
                                            <button className="btn-save" type="submit" form="edit-user-form" onClick={() => { handleSave(); }}>Сохранить</button>
                                            <button className="btn-cancel" onClick={handleCancel}>Отмена</button>
                                        </>
                                    ) : (
                                        <button className="btn-edit" onClick={() => setEditMode(true)}>Редактировать</button>
                                    )}
                                    <button className="btn-logout" onClick={handleLogout}>Выйти</button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
