import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'social';
  icon?: React.ReactNode;
}

export const Button = ({ children, className = '', variant = 'primary', icon, ...props }: ButtonProps) => {
  const baseStyles = "w-full rounded h-[42px] sm:h-[46px] text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 sm:gap-3";
  
  const variants = {
    primary: "bg-[#E6C200] text-black uppercase tracking-wide hover:bg-[#d4b000] active:scale-[0.98] mt-1",
    social: "bg-white text-gray-800 hover:bg-gray-100 border border-transparent"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};