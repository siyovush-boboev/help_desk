import { useState } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "../../lib/contexts/ModalContext.js";

export default function ModalProvider({ children }) {
    const [modalContent, setModalContent] = useState(null);

    const closeModal = () => setModalContent(null);

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
                    document.getElementById("modal")
                )}
        </ModalContext.Provider>
    );
}
