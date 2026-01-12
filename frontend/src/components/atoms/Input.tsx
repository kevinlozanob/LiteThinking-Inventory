import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
            w-full rounded-lg h-[44px] sm:h-[48px] px-4 
            text-gray-800 bg-white border border-gray-200
            placeholder-gray-400 text-sm transition-all duration-300
            focus:outline-none focus:border-[#E6C200] focus:ring-4 focus:ring-[#E6C200]/20 
            hover:border-gray-300
            ${className}
        `}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';