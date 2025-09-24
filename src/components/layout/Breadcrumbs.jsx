const Breadcrumbs = ({ text }) => {
    const parts = text.split('/');
    return (
        <div className='breadcrumbs'>
            {parts.map((part, index) => (
                <span key={index} className="breadcrumb-text">
                    {index > 0 && ' / '}
                    {part.trim()}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumbs;