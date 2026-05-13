import React from 'react';

interface TenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'red' | 'outline-white' | 'pill';
  pulse?: boolean;
}

const TenButton: React.FC<TenButtonProps> = ({ 
  children, 
  variant = 'primary', 
  pulse = false, 
  className = '', 
  ...props 
}) => {
  const baseClass = variant === 'pill' ? 'btn-pill' : `btn-${variant}`;
  const pulseClass = pulse ? 'btn-pulse' : '';
  
  return (
    <button 
      className={`${baseClass} ${pulseClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default TenButton;
