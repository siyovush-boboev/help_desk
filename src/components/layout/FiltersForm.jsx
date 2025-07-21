export default function FiltersModal({ filters, preload, defaultFilters, onApply, onClose }) {
    const handleApply = (e) => {
        const options_list = document.querySelectorAll(".filter-options-list");
        const checked_options = {};
        options_list.forEach((option) => {
            const filter_id = option.id;
            const checked_values = Array.from(
                option.querySelectorAll("input[type='checkbox']:checked")
            ).map((input) => input.value);
            checked_options[filter_id] = checked_values;
        });
        e.stopPropagation();
        onApply(checked_options);
        onClose();
    };

    const resetFilters = () => {
        const options_list = document.querySelectorAll(".filter-options-list");
        options_list.forEach((option) => {
            option.querySelectorAll("input[type='checkbox']").forEach((input) => {
                input.checked = false;
            });
        });
    }

    const filters_list = filters.map((filter, index) => {
        let options = {};
        if (filter.options) {
            options = filter.options.reduce((acc, option, idx) => {
                acc[idx] = option;
                return acc;
            }, {});
        } else {
            options = preload[filter.label.replace("Заявитель", "Пользователь")];
        }

        return (
            <div className="filter-options-list" key={`filter-${index}`} id={filter.id}>
                <p>{filter.label}</p>
                {Object.entries(options).map(([key, value]) => (
                    <label key={key}>
                        <input
                            type="checkbox"
                            value={key["name"]}
                            defaultChecked={defaultFilters[filter.id]?.includes(key)}
                        />
                        {value["name"]}
                    </label>
                ))}
            </div>
        );
    });

    return (
        <div className="modal-form">
            <p>Фильтры</p>
            <div className="filters-list">{filters_list}</div>
            <div className="modal-buttons">
                <button id="confirmBtn" onClick={handleApply}>
                    Применить
                </button>
                <button id="cancelBtn" onClick={(e) => (e.stopPropagation(), onClose())}>
                    Отмена
                </button>
                <button id="resetBtn" onClick={resetFilters}>
                    Cбросить фильтры
                </button>
            </div>
        </div>
    );
}
