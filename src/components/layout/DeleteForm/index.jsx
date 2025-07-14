import { API_BASE_URL } from "../../../lib/constants";
import { API_RESOURCES } from "../../../lib/pages";

export default function DeleteModal({ data, onClose, id = null }) {
    const prepped_data = [];
    data.forEach((item) => {
        prepped_data.push(item.getAttribute("row-id"));
    });
    if (prepped_data.length === 0 && id)
        prepped_data.push(id);

    const handleDelete = (e) => {
        // Call API here to delete the items
        e.stopPropagation();
        onClose();
    }

    if (prepped_data.length !== 0) {
        return (
            <div className="delete-form">
                <p>Вы уверены что хотите удалить элемент с id {prepped_data[0]}{(data.length > 1) && ` и еще ${data.length - 1} элемента`}?</p>
                <div className="modal-buttons">
                    <button id="confirmDeleteBtn" onClick={handleDelete}>
                        Подтвердить
                    </button>
                    <button id="cancelBtn" onClick={(e) => (e.stopPropagation(), onClose())}>
                        Отмена
                    </button>
                </div>
            </div>
        );
    }
}