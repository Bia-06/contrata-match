// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { LandingPage } from './pages/public/LandingPage';
import { JobsList } from './pages/public/JobsList';
import { ApplyForm } from './pages/public/ApplyForm';
import { RestaurantsList } from './pages/public/RestaurantsList';
import { AboutPage } from './pages/public/AboutPage';
import { publicService } from './services/publicService';
import { buildPath, parsePath } from './lib/routes';

function App() {
  const [route, setRoute] = useState(() => parsePath(window.location.pathname));
  const [selectedJob, setSelectedJob] = useState(null);
  const [notFoundJobId, setNotFoundJobId] = useState(null);

  const { page, params } = route;
  const jobNotFound = String(notFoundJobId) === String(params.jobId);

  // Voltar/avançar do navegador
  useEffect(() => {
    const onPop = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Link direto para /vaga/:id — a vaga não veio pela navegação, então busca
  useEffect(() => {
    if (page !== 'apply' || String(selectedJob?.id) === String(params.jobId)) return;
    let cancelled = false;
    publicService.getActiveJobs()
      .then(jobs => {
        if (cancelled) return;
        const found = jobs.find(j => String(j.id) === String(params.jobId));
        if (found) setSelectedJob(found);
        else setNotFoundJobId(params.jobId);
      })
      .catch(() => !cancelled && setNotFoundJobId(params.jobId));
    return () => { cancelled = true; };
  }, [page, params.jobId, selectedJob]);

  // Navegação por estado + URL. Alguns destinos carregam um dado junto:
  // a vaga a candidatar, ou o estabelecimento a filtrar ({ company } = slug,
  // ou { companyId } = id da unidade).
  const handleNavigate = useCallback((destination, payload = null) => {
    const nextParams = {};
    if (destination === 'apply' && payload) {
      setSelectedJob(payload);
      nextParams.jobId = payload.id;
    } else if (destination === 'jobs') {
      nextParams.company = payload?.company || payload?.companyId || payload?.filterCompanyId || null;
    }

    const path = buildPath(destination, nextParams);
    if (path !== window.location.pathname + window.location.search) {
      window.history.pushState(null, '', path);
    }
    setRoute(parsePath(path));
    window.scrollTo(0, 0);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'jobs':
        return <JobsList onNavigate={handleNavigate} filterCompany={params.company} />;
      case 'apply':
        if (selectedJob && String(selectedJob.id) === String(params.jobId)) {
          return <ApplyForm onNavigate={handleNavigate} selectedJob={selectedJob} />;
        }
        if (jobNotFound) {
          return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 px-6 text-center">
              <p className="text-lg font-medium text-emerald-950">Esta vaga não está mais disponível.</p>
              <button onClick={() => handleNavigate('jobs')} className="text-orange-600 font-bold hover:underline text-sm">
                Ver outras vagas
              </button>
            </div>
          );
        }
        return (
          <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        );
      case 'restaurants':
        return <RestaurantsList onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;
