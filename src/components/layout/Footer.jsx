import React from 'react';
import { Handshake, Mail, MapPin } from 'lucide-react';

export const Footer = ({ onNavigate, onOpenModal }) => {
  
  const handleNavClick = (view, e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(view);
  };

  const handleModalClick = (type, e) => {
    e.preventDefault();
    if (onOpenModal) onOpenModal(type);
  };

  return (
    <footer className="bg-emerald-950 text-emerald-100/80 pt-12 pb-8 rounded-t-[2.5rem] mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          
          {/* Coluna 1: Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-emerald-100 shadow-lg shadow-emerald-900/50">
                <Handshake size={16} strokeWidth={2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg font-bold text-emerald-50 tracking-tight">
                  Contrata
                </span>
                <span className="font-sans text-[0.6rem] font-bold tracking-[0.2em] text-orange-500 uppercase">
                  Match
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed opacity-70 max-w-xs">
              Conectando os melhores talentos aos estabelecimentos mais renomados de Marília e região.
            </p>
          </div>

          {/* Coluna 2: Candidatos */}
          <div>
            <h4 className="font-serif text-base font-bold text-emerald-50 mb-4">Para Candidatos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" onClick={(e) => handleNavClick('jobs', e)} className="hover:text-orange-400 transition-colors">Buscar Vagas</a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleNavClick('jobs', e)} className="hover:text-orange-400 transition-colors">Cadastrar Currículo</a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Empresas */}
          <div>
            <h4 className="font-serif text-base font-bold text-emerald-50 mb-4">Para Restaurantes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" onClick={(e) => handleNavClick('adminLogin', e)} className="hover:text-orange-400 transition-colors">Divulgar Vaga</a>
              </li>
              <li>
                <a href="#" onClick={(e) => handleNavClick('adminLogin', e)} className="hover:text-orange-400 transition-colors">Área da Empresa</a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div>
            <h4 className="font-serif text-base font-bold text-emerald-50 mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <span className="text-xs">Marília, SP - Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-orange-500 shrink-0" />
                <span className="text-xs">contato@contratamatch.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-6 border-t border-emerald-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.7rem] opacity-50">
          <p>© 2026 ContrataMatch. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <button onClick={(e) => handleModalClick('terms', e)} className="hover:text-white transition-colors">Termos de Uso</button>
            <button onClick={(e) => handleModalClick('privacy', e)} className="hover:text-white transition-colors">Política de Privacidade</button>
            <button onClick={(e) => handleModalClick('cookies', e)} className="hover:text-white transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};