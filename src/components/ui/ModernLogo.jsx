import React from 'react';
import { Handshake } from 'lucide-react';

export const ModernLogo = ({ className = "" }) => (
  <div className={`flex items-center gap-3 group select-none ${className}`}>
    <div className="relative w-11 h-11 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 to-emerald-800 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-500 group-hover:shadow-orange-500/20 group-hover:rotate-6"></div>
      <div className="relative z-10 text-emerald-50">
          <Handshake size={24} strokeWidth={2} />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-stone-50 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="flex flex-col justify-center leading-none">
      <span className="font-serif text-xl font-bold text-emerald-950 tracking-tight">
        Contrata
      </span>
      <span className="font-sans text-[0.7rem] font-bold tracking-[0.2em] text-orange-600 uppercase translate-x-[1px]">
        Match
      </span>
    </div>
  </div>
);