import { Link } from "react-router-dom";

export default function NavbarLink({ label, href, icon: Icon = null, className = "", ...args }) {
    if (Icon) {
        return (
            <Link to={href} className={`navbar-link ${className}`} {...args}>
                {Icon && <Icon />}
                <span style={{ marginLeft: "0.5rem" }}>{label}</span>
            </Link>
        );
    } else {
        return (
            <Link to={href} className={`dropdown-link ${className}`} {...args}>
                {label}
            </Link>
        );
    }
}
