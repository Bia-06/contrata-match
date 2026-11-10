// src/components/layout/RodapeLegal.jsx
// Rodapé de todas as páginas: links legais e créditos (dados em src/lib/legal.js).
import { Heart } from 'lucide-react';
import { AUTORA, EMAIL_PRIVACIDADE, LINK_PRIVACIDADE, LINK_TERMOS } from '../../lib/legal';

export const RodapeLegal = () => (
  <footer className="border-t border-stone-200 bg-stone-50 px-6 py-6 text-center text-xs text-stone-500">
    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <a href={LINK_PRIVACIDADE} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 underline-offset-2 hover:underline">
        Política de Privacidade
      </a>
      <a href={LINK_TERMOS} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 underline-offset-2 hover:underline">
        Termos de Uso
      </a>
    </nav>
    <p className="mt-3">
      Dúvidas sobre seus dados ou pedido de exclusão da candidatura:{' '}
      <a href={`mailto:${EMAIL_PRIVACIDADE}`} className="underline hover:text-emerald-700">{EMAIL_PRIVACIDADE}</a>
    </p>
    <p className="mt-3 flex flex-wrap items-center justify-center gap-1">
      <span>© {new Date().getFullYear()} ContrataMatch · Feito com</span>
      <Heart size={12} className="text-rose-500 fill-rose-500" aria-label="amor" />
      <span>por</span>
      <a href={AUTORA.portfolio} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 hover:text-orange-500">
        {AUTORA.nome}
      </a>
    </p>
  </footer>
);
