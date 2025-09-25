export default function AuthInput({
    label,
    name,
    placeholder,
    value,
    set_func,
    type = "text",
    required = false,
    inputRef = null,
    children
}) {
    return (
        <div>
            <label htmlFor={name} className="form-label">{label}</label>
            <div className="auth-input-inner">
                <input
                    type={type}
                    name={name}
                    id={name}
                    className="form-control"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set_func(e.target.value)}
                    required={required}
                    ref={inputRef}
                    autoComplete={type === "password" ? "current-password" : "off"}
                />
                {children}
            </div>
        </div>
    );
}
