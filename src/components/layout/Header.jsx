import { useEffect, useState, useContext } from "react";
import UserInfoModal from "../layout/UserInfoModal";
import { TABLE_PAGES_CONFIG } from "../../lib/pages.js";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import { loadDataPreload } from "../../lib/utils/helpers.jsx";
import axiosInstance from "../../lib/contexts/axiosInstance.js";
import { API_BASE_URL } from "../../lib/constants.js";

export default function Header() {
    const { setModalContent, closeModal } = useContext(ModalContext);

    const [preload, setPreload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                await loadDataPreload(setPreload, () => { }, TABLE_PAGES_CONFIG, {
                    ...TABLE_PAGES_CONFIG["department"],
                    preload: ["department"]
                });

                // ✅ Only call /auth/me once
                const res = await axiosInstance.get(`${API_BASE_URL}/auth/me`);
                const {
                    id,
                    fio,
                    position,
                    department_id,
                    email,
                    phoneNumber,
                    avatar
                } = res.data;

                setUserDetails({
                    id,
                    fio,
                    position,
                    department_id,
                    email,
                    phoneNumber,
                    avatar
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to load header data:", err);
            }
        };

        setTimeout(fetchData, 500);
    }, []);

    const onUserClick = () => {
        if (!preload) return;

        setModalContent(
            <UserInfoModal
                userId={userDetails.id}
                onClose={closeModal}
                departments={preload[TABLE_PAGES_CONFIG["department"]["singular"]]}
                data={userDetails}
            />
        );
    };

    return (
        <header>
            <div className="sandwitch" onClick={() => {
                const nav = document.querySelector("nav");
                nav.style.left = nav.style.left === "0px" ? "-1000px" : "0px";
            }}>
                <span>☰</span>
            </div>

            <div className="logo">
                <img src="src/assets/images/header-logo.png" alt="Company Logo" />
            </div>

            <div className="user-info">
                <div className="user-info-clickable" onClick={onUserClick}>
                    <div className="user-text">
                        <h4>{loading ? "Загрузка..." : userDetails.fio}</h4>
                        <p>{loading ? "..." : userDetails.position}</p>
                    </div>
                    <div className="user-avatar">
                        <img
                            width="30"
                            height="30"
                            src="src/assets/svg/person.svg"
                            alt="User Avatar"
                            className="rounded-circle user-logo"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
