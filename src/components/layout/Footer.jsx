import React from 'react';
import { Handshake, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/80 pt-20 pb-10 rounded-t-[3rem] mt-12 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          {/* Coluna 1: Marca e Sobre */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-emerald-100 shadow-lg shadow-emerald-900/50">
                <Handshake size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-xl font-bold text-emerald-50 tracking-tight">
                  Contrata
                </span>
                <span className="font-sans text-[0.65rem] font-bold tracking-[0.2em] text-orange-500 uppercase">
                  Match
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              Conectando os melhores talentos da gastronomia aos estabelecimentos mais renomados do Brasil.
            </p>
            <div className="flex gap-4">
               {/* Ícones Sociais */}
               {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 group">
                   <Icon size={18} />
                 </a>
               ))}
            </div>
          </div>

          {/* Coluna 2: Candidatos */}
          <div>
            <h4 className="font-serif text-lg font-bold text-emerald-50 mb-6">Para Candidatos</h4>
            <ul className="space-y-4 text-sm">
              {['Buscar Vagas', 'Cadastrar Currículo', 'Dicas de Carreira', 'Alertas de Vagas'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Empresas */}
          <div>
            <h4 className="font-serif text-lg font-bold text-emerald-50 mb-6">Para Restaurantes</h4>
            <ul className="space-y-4 text-sm">
              {['Divulgar Vaga', 'Banco de Talentos', 'Planos & Preços', 'Soluções Corporativas'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-orange-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div>
            <h4 className="font-serif text-lg font-bold text-emerald-50 mb-6">Contato</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <span>Av. Paulista, 1000 - SP<br/>Bela Vista, São Paulo</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-orange-500 shrink-0" />
                <span>contato@contratamatch.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 border-t border-emerald-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60">
          <p>© 2026 ContrataMatch. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Termos de Uso</a>
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};