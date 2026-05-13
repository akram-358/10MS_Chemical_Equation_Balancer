import React from 'react';

interface TenCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const TenCard: React.FC<TenCardProps> = ({ children, className = '', hoverable = true }) => {
  return (
    <div className={`card ${hoverable ? 'hover:border-ten-red' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default TenCard;
