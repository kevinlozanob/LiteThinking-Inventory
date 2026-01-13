import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helpText, ...props }, ref) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
      <div className="relative w-full group">
        
        {label && (
          <label 
            className={`
              block text-sm font-bold text-gray-700 mb-1.5 w-fit
              ${helpText ? 'cursor-help border-b-2 border-dotted border-gray-400 hover:border-[#E6C200] hover:text-gray-900 transition-colors' : ''}
            `}
            onMouseEnter={() => helpText && setShowTooltip(true)}
            onMouseLeave={() => helpText && setShowTooltip(false)}
          >
            {label}
          </label>
        )}

        {/* INPUT */}
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
          onFocus={() => helpText && setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          {...props}
        />

        {showTooltip && helpText && (
          <div className="
            absolute z-50 bottom-full left-0 mb-1 
            w-64 px-4 py-3
            bg-gray-800 text-white text-xs font-medium leading-relaxed
            rounded-lg shadow-2xl border-b-2 border-[#E6C200]
            animate-[fadeIn_0.2s_ease-out] pointer-events-none
          ">
            {helpText}
            
            <div className="absolute top-full left-6 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';