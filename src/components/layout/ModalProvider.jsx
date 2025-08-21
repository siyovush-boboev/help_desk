import { useState } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "../../lib/contexts/ModalContext.js";

export default function ModalProvider({ children }) {
    const [modalContent, setModalContent] = useState(null);
    const closeModal = () => setModalContent(null);

    const modal_root = document.getElementById("modal");
    modal_root.onclick = (e) => { if(e.target === modal_root) closeModal(); };

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
