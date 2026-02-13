// src/pages/public/JobsList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Clock, SlidersHorizontal, Building2, Loader2, Inbox, Calendar, DollarSign, ArrowRight } from 'lucide-react';
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
  const [filterCity, setFilterCity] = useState('all');
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

  const formatSchedule = (schedule) => {
    const map = {
      'integral': 'Integral', 'noturno': 'Noturno', 'diurno': 'Diurno',
      'tarde': 'Tarde/Noite', 'escala_6x1': 'Escala 6x1',
      'escala_12x36': 'Escala 12x36', 'flexivel': 'Flexível'
    };
    return map[schedule] || schedule || null;
  };

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term);

      const matchesContract = filterContract === 'all' || job.contract_type === filterContract;

      const matchesCity = filterCity === 'all' ||
        (job.city && job.city.toLowerCase().includes(filterCity.toLowerCase()));

      return matchesSearch && matchesContract && matchesCity;
    });
  }, [jobs, searchTerm, filterContract, filterCity]);

  const activeFilterCount = [filterContract !== 'all', filterCity !== 'all'].filter(Boolean).length;

  // Cores de acento por índice
  const accentGradients = [
    'from-orange-500 to-amber-500',
    'from-emerald-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-yellow-500',
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-emerald-950">
      <Navbar onNavigate={onNavigate} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-emerald-950 mb-2">Vagas Abertas</h1>
          <p className="text-emerald-900/50">
            {loading ? 'Carregando...' : `${filtered.length} oportunidade${filtered.length !== 1 ? 's' : ''} disponíve${filtered.length !== 1 ? 'is' : 'l'}`}
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/30" size={20} />
            <input
              placeholder="Buscar por cargo ou empresa..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-emerald-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-white shadow-sm text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 border rounded-2xl font-medium transition-all text-sm ${showFilters ? 'bg-emerald-900 text-white border-emerald-900 shadow-lg shadow-emerald-900/20' : 'bg-white border-emerald-100 text-emerald-900/70 hover:bg-emerald-50 shadow-sm'}`}
          >
            <SlidersHorizontal size={16} />
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
          <div className="flex flex-wrap gap-4 mb-8 p-5 bg-white border border-emerald-100 rounded-2xl shadow-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-emerald-900/50 mb-2 uppercase tracking-wider">Tipo de Contrato</label>
              <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)}
                className="w-full px-4 py-3 border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white cursor-pointer font-medium">
                <option value="all">Todos</option>
                <option value="clt">CLT</option>
                <option value="pj">Freelancer Fixo</option>
                <option value="extra">Extra (Diária)</option>
                <option value="estagio">Estágio</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-emerald-900/50 mb-2 uppercase tracking-wider">Cidade</label>
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-4 py-3 border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white cursor-pointer font-medium">
                <option value="all">Todas</option>
                <option value="Marília">Marília</option>
                <option value="Garça">Garça</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button onClick={() => { setFilterContract('all'); setFilterCity('all'); }}
                  className="text-sm text-orange-600 font-bold hover:underline px-3 py-3">
                  Limpar
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
          <div className="space-y-5">
            {filtered.map((job, index) => {
              const gradient = accentGradients[index % accentGradients.length];
              const schedule = formatSchedule(job.work_schedule);

              return (
                <div
                  key={job.id}
                  className="group bg-white rounded-[1.75rem] border border-emerald-900/5 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => onNavigate('apply', job)}
                >
                  {/* Barra de acento no topo */}
                  <div className={`h-1 w-full bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity`}></div>

                  <div className="p-6 md:p-7">
                    <div className="flex flex-col md:flex-row gap-5">

                      {/* Logo / Inicial */}
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-stone-50 border border-stone-100 group-hover:border-emerald-200 group-hover:shadow-md transition-all">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.company} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="font-serif font-bold text-2xl text-emerald-700">{job.company.charAt(0)}</span>
                        )}
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 min-w-0">
                        {/* Título + Badge */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-emerald-950 group-hover:text-orange-600 transition-colors leading-tight">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Building2 size={14} className="text-emerald-600" />
                              <span className="text-sm font-semibold text-emerald-700">{job.company}</span>
                            </div>
                          </div>
                          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl uppercase tracking-wide border border-emerald-100 shrink-0">
                            {job.type}
                          </span>
                        </div>

                        {/* Tags de info */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 rounded-xl text-xs font-medium text-stone-600 border border-stone-100">
                            <MapPin size={12} className="text-orange-500" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 rounded-xl text-xs font-medium text-stone-600 border border-stone-100">
                            <DollarSign size={12} className="text-emerald-500" />
                            {job.salary}
                          </span>
                          {schedule && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 rounded-xl text-xs font-medium text-stone-600 border border-stone-100">
                              <Calendar size={12} className="text-blue-500" />
                              {schedule}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 rounded-xl text-xs font-medium text-stone-400 border border-stone-100">
                            <Clock size={12} />
                            {job.posted}
                          </span>
                        </div>

                        {/* Descrição */}
                        {job.description && (
                          <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed mb-4">
                            {job.description}
                          </p>
                        )}

                        {/* Footer do card */}
                        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                          <div className="flex items-center gap-2">
                            {job.seniority && (
                              <span className="text-xs font-medium text-stone-400 bg-stone-50 px-2.5 py-1 rounded-lg">
                                {{ junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior' }[job.seniority] || job.seniority}
                              </span>
                            )}
                            {job.location_mode && job.location_mode !== 'onsite' && (
                              <span className="text-xs font-medium text-violet-500 bg-violet-50 px-2.5 py-1 rounded-lg">
                                {{ remote: 'Remoto', hybrid: 'Híbrido' }[job.location_mode]}
                              </span>
                            )}
                          </div>

                          <button className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 group-hover:text-orange-600 transition-colors">
                            Candidatar-se
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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