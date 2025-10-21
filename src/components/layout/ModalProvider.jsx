import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "../../lib/contexts/ModalContext.js";

export default function ModalProvider({ children }) {
    const [modalContent, setModalContent] = useState(null);
    const closeModal = () => setModalContent(null);

    const modal_root = document.getElementById("modal");

    // Handle clicking outside the modal content
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                e.target === modal_root &&
                document.querySelector(".user-info-modal-content")
            ) {
                closeModal();
            }
        };

        if (modal_root) {
            modal_root.addEventListener("click", handleClickOutside);
        }

        return () => {
            if (modal_root) {
                modal_root.removeEventListener("click", handleClickOutside);
            }
        };
    }, [modal_root]);

    // Handle Esc key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        if (modalContent) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [modalContent]);

    return (
        <ModalContext.Provider value={{ setModalContent, closeModal }}>
            {children}

            {modalContent &&
                createPortal(
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {modalContent}
                    </div>,
                    modal_root
                )}
        </ModalContext.Provider>
    );
}
