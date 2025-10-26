import React from 'react';

interface SpinnerProps {
    isSmall: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ isSmall }) => (
    <div className={isSmall ? "spinner spinner-small" : "spinner"}></div>
);

export default Spinner;