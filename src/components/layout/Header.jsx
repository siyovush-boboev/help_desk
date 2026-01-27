import { useEffect, useState, useContext } from "react";
import UserInfoModal from "../layout/UserInfoModal";
import { TABLE_PAGES_CONFIG } from "../../lib/pages.js";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import { loadDataPreload, onSandwitchClick } from "../../lib/utils/helpers.jsx";
import axiosInstance from "../../lib/contexts/axiosInstance.js";
import { API_BASE_URL, BASE_URL } from "../../lib/constants.js";

import person_svg from "../../assets/svg/person.svg";
import header_logo from "../../assets/images/header-logo.webp";

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
                let {
                    id,
                    fio,
                    position_name,
                    department_id,
                    department_name,
                    // otdel_id,
                    otdel_name,
                    // branch_id,
                    branch_name,
                    // office_id,
                    // office_name,
                    email,
                    phone_number,
                    photo_url,
                } = data;
                if (photo_url) {
                    photo_url = BASE_URL + photo_url;
                }

                setUserDetails({
                    id,
                    fio,
                    position_name,
                    department_id,
                    department_name,
                    otdel_name,
                    branch_name,
                    email,
                    phone_number,
                    photo_url
                });
                localStorage.setItem("user_department_id", JSON.stringify(department_id));
                // localStorage.setItem("user_otdel_id", JSON.stringify(otdel_id));
                // localStorage.setItem("user_branch_id", JSON.stringify(branch_id));
                // localStorage.setItem("user_branch_id", JSON.stringify(office_id));
                localStorage.setItem("user_id", JSON.stringify(id));
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
                data={userDetails}
                details_state={[userDetails, setUserDetails]}
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
                    {loading && <div className="loader-black user-text"></div>}
                    {!loading &&
                        <div className="user-text">
                            <h4>{userDetails.fio.split(" ").slice(0, 2).join(" ")}</h4>
                            <p>{userDetails.position_name}</p>
                        </div>
                    }
                    <div className="user-avatar">
                        <img
                            src={userDetails["photo_url"] ? (userDetails["photo_url"]) : person_svg}
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
