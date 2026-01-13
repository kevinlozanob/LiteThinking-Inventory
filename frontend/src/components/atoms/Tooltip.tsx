import React, { useState } from 'react'; 
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
}

export const Tooltip = ({ text }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center ml-2 z-10"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      <div className="group cursor-help p-1 -m-1 rounded-full hover:bg-gray-100 transition-colors">
        <Info 
          size={16} 
          className="text-gray-400 group-hover:text-[#E6C200] transition-colors" 
        />
      </div>
      
      <div className={`
        absolute bottom-full left-1/2 -translate-x-1/2 mb-3
        w-64 px-4 py-3
        bg-gray-800 text-white text-xs font-medium leading-relaxed
        rounded-lg shadow-2xl border-b-2 border-[#E6C200]
        transition-all duration-200 ease-out origin-bottom
        ${isVisible 
          ? 'opacity-100 transform translate-y-0 scale-100' 
          : 'opacity-0 transform translate-y-2 scale-95 pointer-events-none'}
      `}>
        {text}

        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
      </div>
    </div>
  );
};