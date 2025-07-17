import { API_BASE_URL } from "../../../lib/constants";


function getCorrectSpelling(n) {
    let res = `${n} элемент`;
    if (n == 1)
        return res;
    if (n > 1 && n < 5)
        return res + "а";
    return res + "ов";
}


export default function DeleteModal({ data, onClose, id = null }) {
    const prepped_data = [];
    data.forEach((item) => {
        prepped_data.push(item.getAttribute("row-id"));
    });
    if (prepped_data.length === 0 && id)
        prepped_data.push(id);

    const handleDelete = (e) => {
        // Call API here to delete the items and refresh the page
        e.stopPropagation();
        onClose();
    }

    if (prepped_data.length !== 0) {
        return (
            <div className="modal-form">
                <p>Вы уверены что хотите удалить элемент с id {prepped_data[0]}{(data.length > 1) && ` и еще ${getCorrectSpelling(data.length - 1)}`}?</p>
                <div className="modal-buttons">
                    <button id="confirmBtn" onClick={handleDelete}>
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