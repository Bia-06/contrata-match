// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, CheckCircle, Eye, TrendingUp, ArrowUpRight, Inbox } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { dataService } from './services/dataService';

export const AdminDashboard = ({ setAdminView, user }) => {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) return;
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          dataService.getDashboardStats(user.companyId),
          dataService.getRecentApplications(user.companyId, 5),
        ]);
        setStats(s);
        setRecentApps(r);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.companyId]);

  const statCards = stats ? [
    { label: 'Vagas Ativas', value: stats.activeJobs, subtext: `${stats.totalJobs} total`, icon: Briefcase, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Currículos Recebidos', value: stats.totalApplications, subtext: `${stats.monthApplications} este mês`, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Novos Candidatos', value: stats.weekApplications, subtext: 'Esta semana', icon: Users, color: 'bg-orange-50 text-orange-600' },
    { label: 'Aprovados', value: stats.approvedApplications, subtext: 'Total', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Pendentes', value: stats.pendingApplications, subtext: 'Aguardando análise', icon: Eye, color: 'bg-purple-50 text-purple-600' },
    { label: 'Taxa de Aprovação', value: stats.totalApplications > 0 ? `${Math.round((stats.approvedApplications / stats.totalApplications) * 100)}%` : '—', subtext: 'Aprovados / Total', icon: TrendingUp, color: 'bg-stone-50 text-stone-600' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeInUp_0.5s_ease-out_forwards] pb-10">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <p className="text-sm font-medium text-emerald-600 mb-1 tracking-wide uppercase">Painel Administrativo</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-950 leading-tight">
            Olá, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-emerald-900/50 mt-2 text-base">
            Aqui está o resumo das atividades de <span className="font-semibold text-emerald-900/70">{user?.company}</span>.
          </p>
        </div>
        <Button onClick={() => setAdminView('createJob')} variant="primary" className="shadow-lg shadow-emerald-900/20">
          + Criar Vaga
        </Button>
      </header>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.75rem] border border-emerald-50 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 group cursor-default">
            <div className="flex justify-between items-start mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={22} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-emerald-950 tracking-tight tabular-nums">{stat.value}</h3>
              <p className="text-sm font-medium text-emerald-900/80 mt-1">{stat.label}</p>
              <p className="text-xs text-emerald-900/40 mt-0.5">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Candidaturas Recentes */}
      <div className="bg-white rounded-[2rem] border border-emerald-50 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-8 pb-4">
          <div>
            <h3 className="font-bold text-xl text-emerald-950">Candidaturas Recentes</h3>
            <p className="text-sm text-emerald-900/40 mt-1">Últimas candidaturas recebidas</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAdminView('candidates')}>Ver Todos</Button>
        </div>

        <div className="px-8 pb-8 space-y-2">
          {recentApps.length > 0 ? (
            recentApps.map((app, index) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-stone-50/80 rounded-2xl hover:bg-emerald-50/60 transition-all group cursor-pointer"
                style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-sm shrink-0 group-hover:bg-emerald-200 transition-colors">
                    {app.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm group-hover:text-emerald-700 transition-colors">
                      {app.candidate_name}
                    </h4>
                    <p className="text-xs text-emerald-900/50 mt-0.5">
                      Candidatou-se para <span className="font-semibold text-emerald-900/70">{app.job_title}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-900/40 hidden sm:block">
                    {new Date(app.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <ArrowUpRight size={14} className="text-emerald-900/20 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-emerald-900/40">
              <Inbox size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma candidatura ainda</p>
              <p className="text-sm mt-1">Publique vagas para receber currículos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};