import React from 'react';

interface TenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const TenInput: React.FC<TenInputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--fg-3)] mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-[var(--gray-400)] pointer-events-none">
            {icon}
          </div>
        )}
        <input 
          className={`input-field ${icon ? 'pl-11' : ''} ${error ? 'border-ten-red' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-ten-red flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-ten-red" />
          {error}
        </p>
      )}
    </div>
  );
};

export default TenInput;
