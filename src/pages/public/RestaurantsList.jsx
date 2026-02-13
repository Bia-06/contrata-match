// src/pages/public/RestaurantsList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, ExternalLink, Utensils, Loader2, X, Globe, Phone, Mail } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { publicService } from '../../services/publicService';

// --- Componente do Modal de Detalhes ---
const RestaurantModal = ({ company, onClose, onNavigate }) => {
  if (!company) return null;

  const handleVerVagas = () => {
    onClose();
    // Navega para a página de vagas (o ideal seria filtrar por empresa, 
    // mas por enquanto vai para a lista geral conforme solicitado)
    onNavigate('jobs');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]" onClick={onClose}>
      {/* Container do Modal (o clique aqui não fecha) */}
      <div 
        className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-emerald-100 animate-[scaleIn_0.3s_ease-out] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-stone-100 text-stone-500 hover:text-orange-600 transition-colors z-20 shadow-sm"
        >
          <X size={24} />
        </button>

        {/* Header com Capa e Logo */}
        <div className="relative h-40 bg-emerald-50 shrink-0">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
              <div className="w-full h-full rounded-xl bg-emerald-100 flex items-center justify-center font-serif text-3xl font-bold text-emerald-700 overflow-hidden">
                {company.logo_path ? (
                  <img src={company.logo_path} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  company.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="pt-14 px-8 pb-8 overflow-y-auto custom-scrollbar">
          
          {/* Título e Tags */}
          <div className="mb-6">
            <h2 className="text-3xl font-serif font-bold text-emerald-950 mb-2">{company.name}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wide">
                {company.segment || 'Gastronomia'}
              </span>
              {company.size && (
                <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full uppercase tracking-wide">
                  Equipe {company.size === 'micro' ? 'Micro' : company.size === 'grande' ? 'Grande' : 'Média'}
                </span>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Sobre</h3>
            <p className="text-stone-600 leading-relaxed whitespace-pre-line">
              {company.description || 'Este estabelecimento ainda não adicionou uma descrição detalhada.'}
            </p>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-stone-50 p-4 rounded-xl flex items-start gap-3">
              <MapPin className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase mb-0.5">Localização</p>
                <p className="text-emerald-900 font-medium text-sm">{company.location || 'Não informado'}</p>
              </div>
            </div>

            {company.website && (
              <div className="bg-stone-50 p-4 rounded-xl flex items-start gap-3">
                <Globe className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-0.5">Website / Redes</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-medium text-sm hover:underline truncate block">
                    Acessar página
                  </a>
                </div>
              </div>
            )}

            {/* Exibe Telefone se existir */}
            {company.phone && (
              <div className="bg-stone-50 p-4 rounded-xl flex items-start gap-3">
                <Phone className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-0.5">Contato</p>
                  <p className="text-emerald-900 font-medium text-sm">{company.phone}</p>
                </div>
              </div>
            )}

            {/* Exibe Email se existir */}
            {company.email && (
              <div className="bg-stone-50 p-4 rounded-xl flex items-start gap-3">
                <Mail className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase mb-0.5">Email</p>
                  <p className="text-emerald-900 font-medium text-sm truncate">{company.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer do Modal (Ação) */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 shrink-0 flex justify-end gap-3">
           <Button variant="secondary" onClick={onClose}>
             Fechar
           </Button>
           <Button onClick={handleVerVagas} className="bg-emerald-900 text-white hover:bg-emerald-800 shadow-lg shadow-emerald-900/10">
             Ver Vagas Disponíveis <ExternalLink size={16} className="ml-2" />
           </Button>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export const RestaurantsList = ({ onNavigate }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicService.getCompanies(); 
        setCompanies(data);
      } catch (err) {
        console.error('Erro ao carregar restaurantes:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.location && c.location.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term))
    );
  }, [companies, searchTerm]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-emerald-950">
      <Navbar onNavigate={onNavigate} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

      <RestaurantModal 
        company={selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
        onNavigate={onNavigate}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-950 mb-4">
            Nossos Parceiros
          </h1>
          <p className="text-lg text-emerald-900/60 max-w-2xl mx-auto">
            Conheça os restaurantes, bares e lanchonetes que estão construindo suas equipes através do ContrataMatch.
          </p>
        </div>

        {/* Busca */}
        <div className="max-w-xl mx-auto mb-16 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              placeholder="Buscar restaurante por nome ou cidade..." 
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Restaurantes */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(company => (
              <div 
                key={company.id} 
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                
                {/* Capa / Header do Card */}
                <div className="h-32 bg-emerald-50 relative">
                  <div className="absolute -bottom-8 left-6">
                    {/* AQUI: O evento onClick está APENAS na div da Logo */}
                    <div 
                      onClick={() => setSelectedCompany(company)}
                      className="w-20 h-20 rounded-xl bg-white p-1 shadow-md group-hover:scale-105 transition-transform cursor-pointer"
                      title="Clique para ver detalhes do restaurante"
                    >
                      <div className="w-full h-full rounded-lg bg-emerald-100 flex items-center justify-center font-serif text-2xl font-bold text-emerald-700 overflow-hidden">
                        {company.logo_path ? (
                          <img src={company.logo_path} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          company.name.charAt(0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {company.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin size={14} className="text-emerald-500" />
                    {company.location || 'Localização não informada'}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {company.description || 'Uma excelente oportunidade na gastronomia.'}
                  </p>

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {company.segment || 'Gastronomia'}
                    </span>
                    
                    {/* Botão Ver Vagas (Navegação Direta) */}
                    <button 
                      onClick={() => onNavigate('jobs')} 
                      className="text-sm font-bold text-emerald-700 group-hover:text-orange-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Ver vagas <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 opacity-60">
            <Utensils size={48} className="mx-auto mb-4 text-stone-300" />
            <p className="text-lg font-medium text-emerald-950">Nenhum restaurante encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};