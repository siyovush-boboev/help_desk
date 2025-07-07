import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './style.css';


const Breadcrumbs = ({ text }) => {
    // Split the text into parts and map each part to a span
    const parts = text.split('/');
    return (
        <>
            {parts.map((part, index) => (
                <span key={index} className="breadcrumb-item">
                    {index > 0 && ' / '}
                    <Link to={`/${part.trim()}`}>{part.trim()}</Link>
                </span>
            ))}
        </>
    );
};

Breadcrumbs.propTypes = {
    text: PropTypes.string.isRequired,
};

export default Breadcrumbs;