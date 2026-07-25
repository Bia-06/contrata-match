// src/App.jsx
import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/public/LandingPage';
import { JobsList } from './pages/public/JobsList';
import { ApplyForm } from './pages/public/ApplyForm';
import { RestaurantsList } from './pages/public/RestaurantsList';
import { AboutPage } from './pages/public/AboutPage';

function App() {
  const [page, setPage] = useState('landing');
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterCompanyId, setFilterCompanyId] = useState(null);

  // Navegação por estado. Alguns destinos carregam um dado junto
  // (a vaga a candidatar, ou o estabelecimento a filtrar).
  const handleNavigate = (destination, payload = null) => {
    if (destination === 'apply') {
      setSelectedJob(payload);
    } else if (destination === 'jobs' && payload?.companyId) {
      setFilterCompanyId(payload.companyId);
    } else if (destination === 'jobs') {
      setFilterCompanyId(null);
    }
    setPage(destination);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'jobs':
        return <JobsList onNavigate={handleNavigate} filterCompanyId={filterCompanyId} />;
      case 'apply':
        return <ApplyForm onNavigate={handleNavigate} selectedJob={selectedJob} />;
      case 'restaurants':
        return <RestaurantsList onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return <div className="app">{renderPage()}</div>;
}

export default App;