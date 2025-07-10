export default function NavbarLink({ label, href, icon: Icon = null, ...args }) {

    if (Icon) {
        return (
            <div className="navbar-link">
                {<Icon></Icon>}
                &nbsp;&nbsp;<a href={href} {...args}>{label}</a>
            </div>
        );
    }
    else {
        return (
            <a className="dropdown-link" href={href}>{label}</a>
        );
    }
}