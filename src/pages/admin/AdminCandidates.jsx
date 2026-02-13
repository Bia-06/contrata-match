// src/pages/admin/AdminCandidates.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, Check, X, Star, Circle, Briefcase, Inbox, FileText, Download, MapPin, User, Clock, DollarSign } from 'lucide-react';
import { dataService } from './services/dataService';
import { publicService } from '../../services/publicService';

// Recebe initialFilter que pode conter { searchTerm: 'Nome' }
export const AdminCandidates = ({ user, initialFilter }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Inicia o searchTerm com o valor vindo do dashboard, se existir
  const [searchTerm, setSearchTerm] = useState(initialFilter?.searchTerm || '');
  
  const [selectedJob, setSelectedJob] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingResume, setDownloadingResume] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Se o filtro inicial mudar (navegação), atualiza o search
  useEffect(() => {
    if (initialFilter?.searchTerm) {
      setSearchTerm(initialFilter.searchTerm);
    }
  }, [initialFilter]);

  useEffect(() => {
    if (!user?.companyId) return;
    const load = async () => {
      try {
        const data = await dataService.getCompanyApplications(user.companyId);
        setApplications(data);
      } catch (err) {
        console.error('Erro ao carregar candidaturas:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.companyId]);

  const updateStatus = async (id, newStatus) => {
    try {
      await dataService.updateApplicationStatus(id, newStatus);
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      setOpenMenuId(null);
      const labels = {
        approved: '✅ Candidato aprovado!',
        rejected: '❌ Candidato reprovado.',
        reviewing: '⭐ Candidato em destaque.',
        new: '🔵 Marcado como pendente.',
      };
      showToast(labels[newStatus] || 'Status atualizado.', newStatus === 'rejected' ? 'error' : 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleDownloadResume = async (app) => {
    if (!app.resume_path || app.resume_path === 'not_provided' || app.resume_path === 'upload_failed') {
      showToast('Currículo não disponível.', 'error');
      return;
    }
    setDownloadingResume(app.id);
    try {
      const url = await publicService.getResumeUrl(app.resume_path);
      if (url) { window.open(url, '_blank'); }
      else { showToast('Não foi possível acessar o currículo.', 'error'); }
    } catch (err) {
      console.error('Erro ao baixar currículo:', err);
      showToast('Erro ao acessar currículo.', 'error');
    } finally {
      setDownloadingResume(null);
    }
  };

  const formatAvailability = (val) => {
    const map = { 'imediata': 'Imediata', '1_semana': '1 semana', '2_semanas': '2 semanas', '1_mes': '1 mês', 'a_combinar': 'A combinar' };
    return map[val] || val || null;
  };

  const hasResume = (app) => app.resume_path && app.resume_path !== 'not_provided' && app.resume_path !== 'upload_failed';

  const jobTitles = useMemo(() => [...new Set(applications.map(a => a.job_title))].sort(), [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) || app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = selectedJob === 'all' || app.job_title === selectedJob;
      const matchesTab = activeTab === 'all' || app.status === activeTab;
      return matchesSearch && matchesJob && matchesTab;
    });
  }, [applications, searchTerm, selectedJob, activeTab]);

  const getTabCount = (status) => {
    return applications.filter(app => {
      const matchesJob = selectedJob === 'all' || app.job_title === selectedJob;
      return status === 'all' ? matchesJob : matchesJob && app.status === status;
    }).length;
  };

  const tabs = [
    { id: 'all', label: 'Todos', count: getTabCount('all') },
    { id: 'new', label: 'Pendentes', count: getTabCount('new') },
    { id: 'reviewing', label: 'Em Análise', count: getTabCount('reviewing') },
    { id: 'approved', label: 'Aprovados', count: getTabCount('approved') },
    { id: 'rejected', label: 'Reprovados', count: getTabCount('rejected') },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'reviewing': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  const getStatusLabel = (status) => {
    const labels = { new: 'Novo', reviewing: 'Em Análise', approved: 'Aprovado', rejected: 'Reprovado' };
    return labels[status] || 'Pendente';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeInUp_0.5s_ease-out_forwards] pb-20" onClick={() => setOpenMenuId(null)}>

      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-[fadeIn_0.3s_ease-out]">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-900 text-white'}`}>
            {toast.msg}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-2">Currículos</h1>
        <p className="text-emerald-900/60">Gerencie as candidaturas recebidas para suas vagas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30" size={20} />
          <input className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
            placeholder="Buscar por nome do candidato..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative min-w-[250px]">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30" size={18} />
          <select className="w-full pl-12 pr-10 py-3 bg-white border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none shadow-sm text-emerald-900 font-medium cursor-pointer"
            value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            <option value="all">Todas as Vagas</option>
            {jobTitles.map(title => <option key={title} value={title}>{title}</option>)}
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-900/30 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-100 pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' : 'bg-white text-emerald-900/60 hover:bg-emerald-50'}`}>
            {tab.label} <span className="ml-1 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => {
            const isMenuOpen = openMenuId === app.id;
            return (
              <div key={app.id}
                className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all relative group ${app.status === 'approved' ? 'border-emerald-200' : app.status === 'rejected' ? 'border-red-100 opacity-75' : 'border-emerald-50'}`}>
                <div className="flex flex-col md:flex-row gap-6">

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-2 border-white shadow-sm ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-red-50 text-red-400' : 'bg-stone-100 text-stone-500'}`}>
                    {app.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-emerald-950 group-hover:text-orange-600 transition-colors">{app.candidate_name}</h3>
                      {app.candidate_age && (
                        <span className="text-xs font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                          {app.candidate_age} anos
                        </span>
                      )}
                      {app.status === 'reviewing' && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                          <Star size={10} className="fill-amber-600" /> Em Destaque
                        </span>
                      )}
                    </div>

                    <p className="text-emerald-900 font-medium text-sm mb-3">
                      Aplicou para <span className="font-bold">{app.job_title}</span>
                    </p>

                    {/* Detalhes extras — ícones Lucide */}
                    <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-3 pb-3 border-b border-stone-50">
                      {app.availability && (
                        <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                          <Clock size={11} className="text-stone-400" /> {formatAvailability(app.availability)}
                        </span>
                      )}
                      {app.salary_expectation && (
                        <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                          <DollarSign size={11} className="text-stone-400" /> R$ {Number(app.salary_expectation).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {app.candidate_city && (
                        <span className="inline-flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg">
                          <MapPin size={11} className="text-stone-400" /> {app.candidate_city}
                          {app.candidate_neighborhood ? `, ${app.candidate_neighborhood}` : ''}
                        </span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="text-sm text-stone-500 mb-3 italic leading-relaxed line-clamp-2">
                        "{app.notes}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-900/60">
                      {app.candidate_phone && (
                        <a href={`https://wa.me/55${app.candidate_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-emerald-800 transition-colors">
                          <Phone size={16} className="text-emerald-900/40" />
                          {app.candidate_phone}
                        </a>
                      )}
                      {app.candidate_email && (
                        <a href={`mailto:${app.candidate_email}`}
                          className="flex items-center gap-2 hover:text-emerald-800 transition-colors">
                          <Mail size={16} className="text-emerald-900/40" />
                          {app.candidate_email}
                        </a>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-emerald-900/40" />
                        {new Date(app.created_at).toLocaleDateString('pt-BR')}
                      </div>

                      {hasResume(app) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadResume(app); }}
                          disabled={downloadingResume === app.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-bold transition-colors border border-orange-100"
                        >
                          {downloadingResume === app.id ? (
                            <span className="w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></span>
                          ) : (
                            <Download size={13} />
                          )}
                          Currículo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end gap-4 pl-4 md:border-l border-stone-100 min-w-[140px]">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'approved'); }} title="Aprovar"
                        className={`p-2 rounded-xl transition-all ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-emerald-50 text-stone-400 hover:text-emerald-600'}`}>
                        <Check size={18} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(app.id, 'rejected'); }} title="Reprovar"
                        className={`p-2 rounded-xl transition-all ${app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-stone-400 hover:text-red-600'}`}>
                        <X size={18} />
                      </button>

                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setOpenMenuId(isMenuOpen ? null : app.id)}
                          className={`p-2 rounded-xl transition-colors ${isMenuOpen ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-stone-100 text-stone-400'}`}>
                          <MoreVertical size={18} />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-20 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                            <button onClick={() => updateStatus(app.id, 'approved')}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 text-emerald-900 flex items-center gap-2 font-medium">
                              <Check size={16} className="text-emerald-600" /> Aprovar
                            </button>
                            <button onClick={() => updateStatus(app.id, 'rejected')}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium">
                              <X size={16} /> Reprovar
                            </button>
                            <button onClick={() => updateStatus(app.id, 'reviewing')}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-amber-50 text-amber-600 flex items-center gap-2 font-medium">
                              <Star size={16} /> Destacar
                            </button>
                            {hasResume(app) && (
                              <>
                                <div className="h-px bg-stone-100 my-1"></div>
                                <button onClick={() => { setOpenMenuId(null); handleDownloadResume(app); }}
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 text-orange-600 flex items-center gap-2 font-medium">
                                  <Download size={16} /> Ver Currículo
                                </button>
                              </>
                            )}
                            <div className="h-px bg-stone-100 my-1"></div>
                            <button onClick={() => updateStatus(app.id, 'new')}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-stone-50 text-stone-500 flex items-center gap-2">
                              <Circle size={16} /> Marcar Pendente
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-50">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox size={32} className="text-stone-400" />
            </div>
            <p className="text-lg font-medium text-emerald-950">Nenhum candidato encontrado</p>
            <p className="text-sm">
              {applications.length === 0 ? 'Publique vagas para começar a receber candidaturas.' : 'Tente ajustar os filtros ou a busca.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};