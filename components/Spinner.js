import React from 'react';

const Spinner = ({ isSmall }) => {
    return React.createElement('div', { className: isSmall ? "spinner spinner-small" : "spinner" });
};

export default Spinner;
