import { useEffect, useState, useContext } from "react";
import UserInfoModal from "../layout/UserInfoModal";
import { TABLE_PAGES_CONFIG } from "../../lib/pages.js";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import { loadDataPreload, onSandwitchClick } from "../../lib/utils/helpers.jsx";
import axiosInstance from "../../lib/contexts/axiosInstance.js";
import { API_BASE_URL, BASE_URL } from "../../lib/constants.js";

import person_svg from "../../assets/svg/person.svg";
import header_logo from "../../assets/images/header-logo.png";

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

                const res = await axiosInstance.get(`${API_BASE_URL}/auth/me`);
                const data = res.data.body;
                const {
                    id,
                    fio,
                    position,
                    department_id,
                    email,
                    phone_number,
                    photo_url,
                    role_name,
                } = data;

                localStorage.setItem("user_role", JSON.stringify(role_name).replace('"', ""));
                setUserDetails({
                    id,
                    fio,
                    position,
                    department_id,
                    email,
                    phone_number,
                    photo_url
                });
            } catch (err) {
                console.error("Failed to load header data:", err);
            } finally {
                setLoading(false);
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
            <div className="sandwitch" onClick={onSandwitchClick}>
                <span>☰</span>
            </div>

            <div className="logo">
                <img src={header_logo} alt="Company Logo" />
            </div>

            <div className="user-info">
                <div className="user-info-clickable" onClick={onUserClick}>
                    {loading && <div className="loader-black"></div>}
                    {!loading &&
                        <div className="user-text">
                            <h4>{userDetails.fio}</h4>
                            <p>{userDetails.position}</p>
                        </div>
                    }
                    <div className="user-avatar">
                        <img
                            src={BASE_URL + userDetails["photo_url"] || person_svg}
                            alt=""
                            className="user-logo"
                            style={!userDetails["photo_url"] ? { width: "30px", height: "30px" } : { width: "100%", height: "100%" }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
