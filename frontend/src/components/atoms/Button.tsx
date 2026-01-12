import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'social';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

export const Button = ({ children, className = '', variant = 'primary', icon, ...props }: ButtonProps) => {
  const baseStyles = "w-full rounded-lg h-[44px] sm:h-[48px] text-xs sm:text-sm font-bold transition-all duration-200 ease-out flex items-center justify-center gap-2 sm:gap-3 shadow-sm active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#E6C200] text-black uppercase tracking-wide border-2 border-[#E6C200] hover:bg-white hover:text-[#E6C200] hover:shadow-md hover:-translate-y-0.5",
    
    secondary: "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200",
    
    danger: "bg-red-600 text-white border-2 border-transparent hover:bg-red-700 hover:shadow-md",
    
    outline: "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50",
    
    social: "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:bg-gray-50"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};