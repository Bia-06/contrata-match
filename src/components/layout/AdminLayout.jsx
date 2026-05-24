// src/components/layout/AdminLayout.jsx
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { ModernLogo } from '../ui/ModernLogo';
import { NotificationButton } from '../NotificationButton';

export const AdminLayout = ({ children, activeView, onViewChange, onLogout, user }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral', mobileLabel: 'Início' },
    { id: 'candidates', icon: Users, label: 'Candidatos', mobileLabel: 'Candidatos' },
    { id: 'jobs', icon: FileText, label: 'Vagas', mobileLabel: 'Vagas' },
    { id: 'profile', icon: Settings, label: 'Perfil', mobileLabel: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans text-emerald-950">

      {/* ═══ SIDEBAR DESKTOP ═══ */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-emerald-900/5 fixed h-full z-10">
        <div className="p-8 border-b border-emerald-900/5">
          <ModernLogo />
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${
                activeView === item.id
                  ? 'bg-emerald-50 text-emerald-900 shadow-sm'
                  : 'text-emerald-900/50 hover:bg-stone-50 hover:text-emerald-900'
              }`}
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

      {/* ═══ HEADER MOBILE (logo + sino + sair) ═══ */}
      <header className="md:hidden sticky top-0 z-20 bg-white border-b border-emerald-900/5 px-4 py-3 flex items-center justify-between">
        <div className="scale-90 origin-left">
          <ModernLogo />
        </div>
        <div className="flex items-center gap-1">
          <NotificationButton user={user} />
          <button
            onClick={onLogout}
            title="Sair"
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 md:ml-72 p-4 md:p-12 overflow-y-auto pb-24 md:pb-12 bg-stone-50/50">
        {children}
      </main>

      {/* ═══ BOTTOM NAV MOBILE ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-emerald-900/5 px-2 py-2 shadow-lg shadow-emerald-900/10">
        <div className="flex items-center justify-around">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${
                activeView === item.id
                  ? 'text-emerald-900'
                  : 'text-emerald-900/40'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${
                activeView === item.id ? 'bg-emerald-50' : ''
              }`}>
                <item.icon size={20} />
              </div>
              <span className={`text-[10px] font-semibold ${
                activeView === item.id ? 'text-emerald-900' : 'text-emerald-900/50'
              }`}>
                {item.mobileLabel}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};