import React from 'react';
import { Globe } from 'lucide-react';

interface AuthTemplateProps {
  children: React.ReactNode;
}

export const AuthTemplate = ({ children }: AuthTemplateProps) => {
  return (
    <div className="relative min-h-screen w-full bg-[#0d0d0d] font-sans text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/dark-circuit-board-pattern-with-golden-padlock-sec.jpg')" }} />
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Idioma */}
      <div className="absolute top-3 right-4 sm:top-4 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white cursor-pointer hover:text-gray-300">
        <Globe size={14} className="sm:w-4 sm:h-4" />
        <span>Español</span>
      </div>

      {/* Main Container*/}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        {/* LOGO - Responsive */}
        <div className="mb-4 sm:mb-6 flex flex-col items-center select-none">
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-baseline">
            <span>Creden</span>
            <span className="text-[#E6C200] relative">
              t<span className="absolute -top-1 left-0 w-full h-0.5 bg-[#E6C200]"></span>
            </span>
            <span>ials</span>
          </div>
          <div className="text-[8px] sm:text-[9px] tracking-[0.2em] text-white/80 mt-0.5">by Nicklcs</div>
        </div>

        {/* Card Content*/}
        <div className="w-full max-w-[340px] sm:max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  );
};