import { Link } from 'react-router-dom';
import './style.css';


const Breadcrumbs = ({ text }) => {
    // Split the text into parts and map each part to a span
    const parts = text.split('/');
    return (
        <div className='breadcrumbs'>
            {parts.map((part, index) => (
                <span key={index} className="breadcrumb-item">
                    {index > 0 && ' / '}
                    {part.trim()}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumbs;