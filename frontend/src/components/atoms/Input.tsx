import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded h-[42px] sm:h-[46px] px-3 sm:px-4 text-gray-700 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E6C200] text-sm transition-all ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';