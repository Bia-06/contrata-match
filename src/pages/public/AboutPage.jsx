import React, { useState } from 'react';
import { ChefHat, Heart, Zap, Users, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';

export const AboutPage = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-emerald-950 overflow-x-hidden">
      <Navbar onNavigate={onNavigate} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 bg-emerald-900 text-white overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20 -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Nascemos dentro da <br/>
            <span className="text-orange-400 italic">cozinha</span>
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/80 leading-relaxed max-w-2xl mx-auto">
            O ContrataMatch não é apenas um site de empregos. É a ponte entre a paixão pela gastronomia e a necessidade de excelência no serviço.
          </p>
        </div>
      </section>

      {/* Nossa História / Missão */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] bg-stone-200 rounded-2xl overflow-hidden relative z-10 shadow-2xl rotate-2">
                {/* Imagem adicionada aqui */}
                <img 
                  src="https://images.unsplash.com/photo-1758520144427-ddb02ac74e9d?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Equipe profissional de cozinha trabalhando em sintonia" 
                  className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute inset-0 border-2 border-emerald-900 rounded-2xl -rotate-2 z-0 transform translate-x-4 translate-y-4"></div>
          </div>
          
          <div className="space-y-6">
            <span className="text-orange-600 font-bold uppercase tracking-wider text-sm">Nossa Missão</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-950">
              Transformar a forma como são contratados profissionais
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Sabemos que contratar para restaurantes, bares e lanchonetes é um desafio único. A rotatividade é alta, o tempo é curto e a química da equipe é essencial.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Criamos uma plataforma que entende a diferença entre as funções. Que valoriza tanto a técnica quanto a disponibilidade. Nosso objetivo é simplificar o processo para que você possa focar no que importa: servir bem.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-white border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Zap, title: "Agilidade", text: "Processos rápidos porque o negócio não pode parar." },
              { icon: Heart, title: "Paixão", text: "Conectamos pessoas que amam o que fazem." },
              { icon: Users, title: "Comunidade", text: "Incentivamos o crescimento do setor local." }
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon size={32} />
                </div>
                <h3 className="font-serif font-bold text-xl mb-3 text-emerald-950">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-emerald-900 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Pronto para começar?</h2>
            <p className="text-emerald-100/70 mb-10 max-w-lg mx-auto">
              Seja você um talento em busca de oportunidade ou um estabelecimento buscando excelência.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none" onClick={() => onNavigate('jobs')}>
                Ver Vagas
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => onNavigate('adminLogin')}>
                Sou Empresa
              </Button>
            </div>
          </div>
          
          {/* Círculos decorativos */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>

    </div>
  );
};