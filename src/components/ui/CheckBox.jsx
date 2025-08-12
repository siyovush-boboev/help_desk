const CheckBox = ({ id, checked, onChangeFunc, children }) => {
    return (
        <div className="form-check">
            <input
                type="checkbox"
                className="form-check-input"
                id={id}
                checked={checked}
                onChange={(e) => onChangeFunc(e.target.checked)}
            />
            <label className="form-check-label" htmlFor={id}>
                {children}
            </label>
        </div>
    );
};

export default CheckBox;
