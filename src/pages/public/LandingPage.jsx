// src/pages/public/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Wine, Coffee, Store, UtensilsCrossed, ChevronLeft, ChevronRight, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/layout/Footer'; 
import { publicService } from '../../services/publicService';

// Componente para animar elementos quando entram na tela
const FadeInSection = ({ children, delay = '0ms' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    });
    
    const { current } = domRef;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

export const LandingPage = ({ onNavigate, onMenuToggle, isMenuOpen, onOpenModal }) => {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicService.getActiveJobs();
        setJobs(data);
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
      } finally {
        setLoadingJobs(false);
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
    return map[schedule] || schedule || 'Integral';
  };

  const accentColors = [
    'bg-orange-500', 'bg-emerald-500', 'bg-purple-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500',
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-emerald-950 overflow-x-hidden">
      <Navbar onNavigate={onNavigate} onMenuToggle={onMenuToggle} isMenuOpen={isMenuOpen} />

      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative pt-12 pb-20 px-6">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>

          <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="text-left space-y-6 animate-[fadeInUp_0.5s_ease-out_forwards]">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm text-sm font-medium text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                {jobs.length > 0 ? `${jobs.length} vaga${jobs.length !== 1 ? 's' : ''} aberta${jobs.length !== 1 ? 's' : ''} agora` : 'Conectando talentos à gastronomia'}
              </div>

              <h1 className="text-6xl md:text-7xl font-serif font-medium leading-[1.05] tracking-tight">
                O match perfeito <br />
                <span className="italic text-emerald-800 relative inline-block">
                  para seu negócio
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </span> <br />
                está aqui.
              </h1>

              <p className="text-xl text-emerald-900/60 max-w-lg leading-relaxed">
                A plataforma que conecta talentos aos melhores estabelecimentos com inteligência e rapidez.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button size="lg" onClick={() => onNavigate('jobs')} className="shadow-orange-200 shadow-2xl">
                  Encontrar Vagas
                </Button>
              </div>
            </div>

            {/* Ilustração/Cards */}
            <div className="relative h-[550px] hidden md:block">
              <div className="absolute top-6 right-6 w-64 bg-white p-5 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-emerald-50 z-20 animate-[float_6s_infinite_ease-in-out]">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <ChefHat size={20} />
                  </div>
                  <span className="text-xs font-bold bg-stone-100 px-2 py-1 rounded-md text-stone-500">
                    {jobs[0]?.posted || 'Agora'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg mb-1">{jobs[0]?.title || 'Chef Executivo'}</h3>
                <p className="text-sm text-emerald-900/50 mb-3">{jobs[0]?.company || 'Seu Restaurante'}</p>
                <p className="text-xs text-right mt-1 text-orange-600 font-medium">98% Match</p>
              </div>

              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-80 bg-emerald-900 rounded-[2rem] rotate-[-6deg] overflow-hidden shadow-2xl z-10 flex flex-col items-center justify-center text-emerald-50 text-center p-6">
                <div className="bg-emerald-800/50 p-4 rounded-full mb-4 animate-pulse">
                  <MapPin size={48} className="text-orange-400" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2">Foco Regional</h3>
                <p className="text-emerald-200/80 text-sm leading-relaxed">
                  Conectando profissionais e empresas exclusivamente em:
                </p>
                <div className="mt-4 flex flex-col gap-2 w-full">
                  <div className="bg-emerald-800/50 px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Marília
                  </div>
                  <div className="bg-emerald-800/50 px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Garça
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CATEGORIAS ═══ */}
        <section className="py-16 border-y border-emerald-900/5 bg-white relative overflow-hidden">
          <FadeInSection>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl font-serif font-bold text-emerald-950">Áreas de Atuação</h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full border border-emerald-100 hover:bg-emerald-50 text-emerald-900"><ChevronLeft size={20} /></button>
                  <button className="p-2 rounded-full border border-emerald-100 hover:bg-emerald-50 text-emerald-900"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
                {[
                  { icon: ChefHat, label: 'Cozinha', color: 'bg-orange-50 text-orange-600' },
                  { icon: Wine, label: 'Bar', color: 'bg-purple-50 text-purple-600' },
                  { icon: Coffee, label: 'Salão', color: 'bg-amber-50 text-amber-600' },
                  { icon: Store, label: 'Gerência', color: 'bg-blue-50 text-blue-600' },
                  { icon: UtensilsCrossed, label: 'Auxiliares', color: 'bg-emerald-50 text-emerald-600' },
                ].map((cat, i) => (
                  <div key={i} onClick={() => onNavigate('jobs')} className="min-w-[240px] p-6 rounded-3xl bg-stone-50 border border-stone-100 cursor-pointer card-hover snap-center group">
                    <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <cat.icon size={28} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{cat.label}</h3>
                    <div className="flex items-center gap-2 text-sm text-emerald-900/50">
                      <span className="w-2 h-2 rounded-full bg-emerald-200"></span>
                      Ver vagas
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* ═══ VAGAS DESTAQUE ═══ */}
        <section className="py-24 bg-stone-50 relative">
          <div className="max-w-5xl mx-auto px-6">
            <FadeInSection>
              <div className="text-center mb-16">
                <span className="text-orange-600 font-serif italic text-xl">Oportunidades</span>
                <h2 className="text-4xl font-bold mt-2 mb-4 text-emerald-950">Destaques da Semana</h2>
              </div>
            </FadeInSection>

            {loadingJobs ? (
              <div className="flex justify-center py-16">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 6).map((job, index) => (
                  <FadeInSection key={job.id} delay={`${index * 100}ms`}>
                    <div
                      onClick={() => onNavigate('apply', job)}
                      className="group bg-white p-6 rounded-3xl border border-emerald-900/5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
                    >
                      {/* Barra colorida lateral */}
                      <div className={`absolute left-0 top-0 w-1 h-full ${accentColors[index % accentColors.length]} group-hover:w-2 transition-all`}></div>

                      {/* Logo ou Inicial da empresa */}
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden bg-stone-100 group-hover:bg-emerald-900 transition-colors">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <span className="font-serif font-bold text-2xl text-stone-400 group-hover:text-white transition-colors">
                            {job.company.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-xl group-hover:text-orange-600 transition-colors">{job.title}</h3>
                        <p className="text-emerald-900/50 text-sm mt-1">
                          {job.company} • {job.location}
                          {job.work_schedule ? ` • ${formatSchedule(job.work_schedule)}` : ''}
                        </p>
                      </div>

                      {/* Salário e data */}
                      <div className="text-right pl-4 border-l border-stone-100 hidden md:block min-w-[140px]">
                        <p className="font-bold text-emerald-900">{job.salary}</p>
                        <p className="text-xs text-stone-400 mt-1">{job.posted}</p>
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            ) : (
              <FadeInSection>
                <div className="text-center py-16 opacity-60">
                  <UtensilsCrossed size={48} className="mx-auto mb-4 text-stone-300" />
                  <p className="text-lg font-medium text-emerald-950">Nenhuma vaga publicada ainda</p>
                  <p className="text-sm text-emerald-900/50 mt-2">As vagas aparecerão aqui assim que os restaurantes começarem a publicar.</p>
                 
                </div>
              </FadeInSection>
            )}

            {jobs.length > 6 && (
              <FadeInSection delay="200ms">
                <div className="text-center mt-10">
                  <Button variant="secondary" size="lg" onClick={() => onNavigate('jobs')}>
                    Ver todas as {jobs.length} vagas
                  </Button>
                </div>
              </FadeInSection>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};