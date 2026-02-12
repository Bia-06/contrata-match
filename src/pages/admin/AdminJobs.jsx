import React, { useState, useEffect } from 'react';
import { Briefcase, Pause, Play, Trash2, Plus, Inbox, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { dataService } from './services/dataService';

export const AdminJobs = ({ setAdminView, user, showToast }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) return;
    loadJobs();
  }, [user?.companyId]);

  const loadJobs = async () => {
    try {
      const data = await dataService.getCompanyJobs(user.companyId);
      setJobs(data);
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    try {
      await dataService.updateJob(job.id, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      showToast(newStatus === 'active' ? 'Vaga reativada!' : 'Vaga pausada.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar vaga.');
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga? Todas as candidaturas serão removidas.')) return;
    try {
      await dataService.deleteJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      showToast('Vaga excluída.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir vaga.');
    }
  };

  // Helper de Formatação de Moeda
  const formatCurrency = (val) => {
    if (!val) return 'A combinar';
    // Se o usuário digitou texto livre que não parece número
    if (isNaN(Number(String(val).replace(/[^0-9,-]/g, '')))) return val;
    
    // Tenta converter e formatar
    try {
      const number = parseFloat(String(val).replace('R$', '').replace('.', '').replace(',', '.').trim());
      return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } catch (e) {
      return val;
    }
  };

  // Helper para Primeira Letra Maiúscula
  const formatTitle = (title) => {
    if (!title) return '';
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return { label: 'Ativa', cls: 'bg-emerald-100 text-emerald-700' };
      case 'paused': return { label: 'Pausada', cls: 'bg-amber-100 text-amber-700' };
      case 'closed': return { label: 'Encerrada', cls: 'bg-stone-100 text-stone-500' };
      default: return { label: status, cls: 'bg-stone-100 text-stone-500' };
    }
  };

  const getContractLabel = (type) => {
    const labels = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', extra: 'Extra (Diária)' };
    return labels[type] || type || '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeInUp_0.5s_ease-out_forwards]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-2">Minhas Vagas</h1>
          <p className="text-emerald-900/60">{jobs.length} vaga{jobs.length !== 1 ? 's' : ''} cadastrada{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setAdminView('createJob')}>
          <Plus size={18} className="mr-1" /> Criar Vaga
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map(job => {
            const badge = getStatusBadge(job.status);
            return (
              <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm hover:border-orange-200 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        {/* Título formatado */}
                        <h3 className="font-bold text-lg text-emerald-950">{formatTitle(job.title)}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <p className="text-emerald-900/50 text-sm">
                        {job.city && job.state ? `${job.city}, ${job.state}` : job.location_mode === 'remote' ? 'Remoto' : '—'}
                        {job.contract_type ? ` • ${getContractLabel(job.contract_type)}` : ''}
                        {/* Salário Formatado */}
                        {job.salary_range ? ` • ${formatCurrency(job.salary_range)}` : ''}
                      </p>
                      <p className="text-xs text-emerald-900/30 mt-1">
                        Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start shrink-0">
                    {/* Botão Editar (Passa o objeto job inteiro como segundo argumento) */}
                    <button 
                      onClick={() => setAdminView('createJob', job)}
                      className="p-2.5 rounded-xl text-stone-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      title="Editar vaga"
                    >
                      <Edit size={16} />
                    </button>

                    <Button variant="secondary" size="sm" onClick={() => toggleStatus(job)}
                      className="flex items-center gap-1.5">
                      {job.status === 'active' ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Ativar</>}
                    </Button>
                    
                    <button onClick={() => handleDelete(job.id)}
                      className="p-2.5 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Excluir vaga">
                      <Trash2 size={16} />
                    </button>
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
            <p className="text-lg font-medium text-emerald-950">Nenhuma vaga criada</p>
            <p className="text-sm mb-6">Crie sua primeira vaga para começar a receber candidatos.</p>
            <Button onClick={() => setAdminView('createJob')}>+ Criar Primeira Vaga</Button>
          </div>
        )}
      </div>
    </div>
  );
};