import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Building2, ExternalLink, Utensils, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { publicService } from '../../services/publicService';

export const RestaurantsList = ({ onNavigate }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Precisaremos adicionar este método no publicService
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-950 mb-4">
            Nossos Parceiros
          </h1>
          <p className="text-lg text-emerald-900/60 max-w-2xl mx-auto">
            Conheça os restaurantes, bares e cafés que estão construindo suas equipes através do ContrataMatch.
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
              <div key={company.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col h-full">
                
                {/* Capa / Header do Card */}
                <div className="h-32 bg-emerald-50 relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-20 h-20 rounded-xl bg-white p-1 shadow-md">
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
                    
                    <button 
                      onClick={() => onNavigate('jobs')} // Idealmente filtraria por empresa
                      className="text-sm font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
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