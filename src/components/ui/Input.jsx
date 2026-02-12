import React from 'react';

export const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-emerald-900/80">{label}</label>}
    <input 
      className="w-full px-5 py-3 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-xl text-emerald-950 placeholder:text-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-sm hover:bg-white" 
      {...props} 
    />
  </div>
);