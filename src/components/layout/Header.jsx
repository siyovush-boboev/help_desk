import { useContext, useEffect, useState } from "react";
import UserInfoModal from "../layout/UserInfoModal";
import { TABLE_PAGES_CONFIG } from "../../lib/pages.js";
import { AuthContext } from "../../lib/contexts/authContext";
import { ModalContext } from "../../lib/contexts/ModalContext.js";
import { loadDataPreload } from "../../lib/utils/helpers.jsx";
import axiosInstance from "../../lib/contexts/axiosInstance.js";
import { API_BASE_URL } from "../../lib/constants.js";

export default function Header() {
    const { userData } = useContext(AuthContext);
    const { setModalContent, closeModal } = useContext(ModalContext);

    const [preload, setPreload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState({ fio: "", position: "" });

    // 🔁 Load departments + user details on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                await loadDataPreload(setPreload, () => { }, TABLE_PAGES_CONFIG, {
                    ...TABLE_PAGES_CONFIG["department"], preload: ["department"]
                });

                const userEndpoint = `${API_BASE_URL}/${TABLE_PAGES_CONFIG["user"].resource}/${userData.id}`;
                const res = await axiosInstance.get(userEndpoint);
                let { fio, position } = res.data.result;
                fio = fio.split(" ").slice(0, 2).join(" ");

                setUserDetails({ fio, position });
                setLoading(false);
            } catch (err) {
                console.error("Failed to load header data:", err);
            }
        };

        fetchData();
    }, [userData.id]);

    const onUserClick = (userId) => {
        if (!preload) return;

        setModalContent(
            <UserInfoModal
                userId={userId}
                onClose={closeModal}
                departments={preload[TABLE_PAGES_CONFIG["department"]["singular"]]}
            />
        );
    };
    console.log(preload);

    return (
        <header>
            <div className="sandwitch" onClick={() => {
                const nav = document.querySelector('nav');
                nav.style.left = nav.style.left === '0px' ? '-1000px' : '0px';
            }}>
                <span>☰</span>
            </div>

            <div className="logo">
                <img src="src/assets/images/header-logo.png" alt="Company Logo" />
            </div>

            <div className="user-info">
                <div className="user-info-clickable" onClick={() => onUserClick(userData.id)}>
                    <div className="user-text">
                        <h4>{loading ? "Loading..." : userDetails.fio}</h4>
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
