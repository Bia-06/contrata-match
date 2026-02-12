import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'default', className = '', onClick, disabled, type = 'button' }) => {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-4 py-1.5 text-sm rounded-full",
    default: "px-6 py-3 text-sm rounded-full",
    lg: "px-8 py-4 text-base rounded-full"
  };

  const variants = {
    primary: "bg-emerald-900 text-emerald-50 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-900/20 active:scale-95",
    secondary: "bg-white text-emerald-900 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 shadow-sm",
    accent: "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 rotate-1 hover:rotate-0",
    ghost: "text-emerald-700 hover:bg-emerald-50/50 hover:text-emerald-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};