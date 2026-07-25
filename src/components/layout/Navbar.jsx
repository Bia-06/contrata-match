import React from 'react';
import { Menu, X } from 'lucide-react';
import { ModernLogo } from '../ui/ModernLogo'; 
import { Button } from '../ui/Button';

export const Navbar = ({ minimal = false, onNavigate, onMenuToggle, isMenuOpen }) => {
  
  const handleNav = (target) => {
    onNavigate(target);
    if (isMenuOpen && onMenuToggle) onMenuToggle();
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${minimal ? 'bg-stone-50' : 'bg-stone-50/80 backdrop-blur-xl border-b border-emerald-900/5'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Click */}
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleNav('landing')}>
          <ModernLogo /> 
        </div>

        {!minimal && (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              {/* NOVO: Link Início */}
              <button onClick={() => handleNav('landing')} className="text-sm font-medium text-emerald-900/60 hover:text-orange-600 transition-colors relative group">
                Início
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </button>

              <button onClick={() => handleNav('jobs')} className="text-sm font-medium text-emerald-900/60 hover:text-orange-600 transition-colors relative group">
                Vagas
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </button>
              
              <button onClick={() => handleNav('restaurants')} className="text-sm font-medium text-emerald-900/60 hover:text-orange-600 transition-colors relative group">
                Restaurantes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </button>
              
              <button onClick={() => handleNav('about')} className="text-sm font-medium text-emerald-900/60 hover:text-orange-600 transition-colors relative group">
                Sobre
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="accent" size="sm" onClick={() => handleNav('jobs')}>Buscar Vagas</Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-emerald-900" onClick={onMenuToggle}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && !minimal && (
        <div className="md:hidden border-t border-emerald-100 bg-stone-50 p-6 space-y-4 shadow-xl absolute w-full rounded-b-3xl animate-[fadeIn_0.2s_ease-out]">
          {/* NOVO: Link Início Mobile */}
          <button onClick={() => handleNav('landing')} className="block w-full text-left py-3 font-medium text-emerald-900 border-b border-gray-100">
            Início
          </button>
          <button onClick={() => handleNav('jobs')} className="block w-full text-left py-3 font-medium text-emerald-900 border-b border-gray-100">
            Buscar Vagas
          </button>
          <button onClick={() => handleNav('restaurants')} className="block w-full text-left py-3 font-medium text-emerald-900 border-b border-gray-100">
            Restaurantes Parceiros
          </button>
          <button onClick={() => handleNav('about')} className="block w-full text-left py-3 font-medium text-emerald-900 border-b border-gray-100">
            Sobre Nós
          </button>
          <button onClick={() => handleNav('adminLogin')} className="block w-full text-left py-3 font-bold text-emerald-700">
            Área da Empresa / Login
          </button>
        </div>
      )}
    </nav>
  );
};