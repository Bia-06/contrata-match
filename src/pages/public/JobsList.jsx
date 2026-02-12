// src/pages/public/JobsList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Clock, SlidersHorizontal, ChevronDown, Building2, Loader2, Inbox, Calendar } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { publicService } from '../../services/publicService';

export const JobsList = ({ onNavigate }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Filtros
  const [filterContract, setFilterContract] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicService.getActiveJobs();
        setJobs(data);
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Helper para formatar o turno
  const formatSchedule = (schedule) => {
    const map = {
      'integral': 'Integral',
      'noturno': 'Noturno',
      'diurno': 'Diurno',
      'tarde': 'Tarde/Noite',
      'escala_6x1': 'Escala 6x1',
      'escala_12x36': 'Escala 12x36',
      'flexivel': 'Flexível'
    };
    return map[schedule] || schedule || 'Integral';
  };

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term);

      const matchesContract = filterContract === 'all' || job.contract_type === filterContract;
      const matchesMode = filterMode === 'all' || job.location_mode === filterMode;

      return matchesSearch && matchesContract && matchesMode;
    });
  }, [jobs, searchTerm, filterContract, filterMode]);

  const activeFilterCount = [filterContract !== 'all', filterMode !== 'all'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-emerald-950">
      <Navbar onNavigate={onNavigate} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-1">Vagas Abertas</h1>
          <p className="text-emerald-900/50 text-sm">
            {loading ? 'Carregando...' : `${filtered.length} vaga${filtered.length !== 1 ? 's' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              placeholder="Buscar por cargo, empresa ou cidade..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 border rounded-lg font-medium transition-colors ${showFilters ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal size={18} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white border border-gray-200 rounded-xl animate-[fadeIn_0.2s_ease-out]">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo de Contrato</label>
              <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white cursor-pointer">
                <option value="all">Todos</option>
                <option value="clt">CLT</option>
                <option value="pj">PJ</option>
                <option value="estagio">Estágio</option>
                <option value="extra">Extra (Diária)</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Modalidade</label>
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white cursor-pointer">
                <option value="all">Todas</option>
                <option value="onsite">Presencial</option>
                <option value="hybrid">Híbrido</option>
                <option value="remote">Remoto</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button onClick={() => { setFilterContract('all'); setFilterMode('all'); }}
                  className="text-sm text-orange-600 font-medium hover:underline px-2 py-2.5">
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista de Vagas */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">

                  {/* Logo / Inicial */}
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center font-serif font-bold text-2xl text-emerald-700 shrink-0">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      job.company.charAt(0)
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide shrink-0 ml-4">
                        {job.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-700 font-medium mb-3">
                      <Building2 size={16} />
                      {job.company}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                      <span className="font-semibold text-gray-700">{job.salary}</span>
                      {/* Novo campo de Período */}
                      <span className="flex items-center gap-1 text-emerald-700"><Calendar size={16} /> {formatSchedule(job.work_schedule)}</span>
                      <span className="flex items-center gap-1"><Clock size={16} /> {job.posted}</span>
                    </div>

                    {job.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description}</p>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={() => onNavigate('apply', job)}
                        className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg px-6 py-2.5 text-sm font-semibold">
                        Candidatar-se
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox size={32} className="text-stone-400" />
            </div>
            <p className="text-lg font-medium text-emerald-950">
              {jobs.length === 0 ? 'Nenhuma vaga publicada ainda' : 'Nenhuma vaga encontrada'}
            </p>
            <p className="text-sm text-emerald-900/50 mt-2">
              {jobs.length === 0
                ? 'As vagas aparecerão aqui assim que os restaurantes começarem a publicar.'
                : 'Tente ajustar a busca ou os filtros.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};