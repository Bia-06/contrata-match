// src/components/layout/AdminLayout.jsx
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { ModernLogo } from '../ui/ModernLogo';
import { NotificationButton } from '../NotificationButton';

export const AdminLayout = ({ children, activeView, onViewChange, onLogout, user }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { id: 'candidates', icon: Users, label: 'Candidatos' },
    { id: 'jobs', icon: FileText, label: 'Vagas' },
    { id: 'profile', icon: Settings, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans text-emerald-950">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-emerald-900/5 fixed h-full z-10">
        <div className="p-8 border-b border-emerald-900/5">
          <ModernLogo />
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => onViewChange(item.id)} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${activeView === item.id ? 'bg-emerald-50 text-emerald-900 shadow-sm' : 'text-emerald-900/50 hover:bg-stone-50 hover:text-emerald-900'}`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-emerald-900/5">
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex-1 flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut size={18} /> Sair
            </button>
            <NotificationButton user={user} />
          </div>
        </div>
      </aside>
      <main className="flex-1 md:ml-72 p-6 md:p-12 overflow-y-auto h-screen bg-stone-50/50">
        {children}
      </main>
    </div>
  );
};