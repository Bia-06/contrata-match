import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

// Páginas Públicas
import { LandingPage } from './pages/public/LandingPage';
import { JobsList } from './pages/public/JobsList';
import { ApplyForm } from './pages/public/ApplyForm';
import { RestaurantsList } from './pages/public/RestaurantsList';
import { AboutPage } from './pages/public/AboutPage';

// Páginas Administrativas
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminJobs } from './pages/admin/AdminJobs';
import { AdminCreateJob } from './pages/admin/AdminCreateJob';
import { AdminCandidates } from './pages/admin/AdminCandidates';
import { AdminProfile } from './pages/admin/AdminProfile';

// Serviços
import { authService } from './pages/admin/services/authService'; 

export default function App() {
  const [view, setView] = useState('landing');
  const [adminView, setAdminView] = useState('dashboard');
  
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // selectedJob: usado para aplicar para vaga (público) OU editar vaga (admin)
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [toast, setToast] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // ── 1. Recupera sessão ao carregar ──
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          const company = await authService.getCurrentCompany();
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: company?.name || 'Administrador',
            company: company?.name || '',
            companyId: company?.id || null,
            logo: company?.logo_path || null
          });
          if (view === 'landing' || view === 'adminLogin') {
            setView('adminDashboard');
          }
        }
      } catch (err) {
        console.error('Sessão não recuperada:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };
    recoverSession();
  }, []);

  // ── 2. Listener de auth ──
  useEffect(() => {
    const { data } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setView('landing');
        setAdminView('dashboard');
      }
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  // ── Navegação Unificada ──
  const navigate = (target, params = null) => {
    if (params) setSelectedJob(params);
    if (target === 'adminDashboard' && !user) {
      setView('adminLogin');
    } else {
      setView(target);
    }
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Navegação Interna do Admin (Dashboard) ──
  // Essa função garante que ao clicar em "Editar", os dados da vaga sejam passados
  const handleAdminViewChange = (viewName, data = null) => {
    setAdminView(viewName);
    if (viewName === 'createJob') {
      // Se tiver data, estamos editando. Se for null, estamos criando.
      setSelectedJob(data); 
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate('landing');
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-emerald-900/50 text-sm font-medium font-serif">Carregando ContrataMatch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased text-emerald-950 font-sans">
      
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-[float_0.5s_ease-out]">
          <div className="bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-800">
            <CheckCircle size={20} className="text-emerald-400" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}

      {view === 'landing' && (
        <LandingPage onNavigate={navigate} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
      )}
      
      {view === 'jobs' && <JobsList onNavigate={navigate} />}
      {view === 'restaurants' && <RestaurantsList onNavigate={navigate} />}
      {view === 'about' && <AboutPage onNavigate={navigate} />}
      {view === 'apply' && <ApplyForm selectedJob={selectedJob} onNavigate={navigate} showToast={showToast} />}
      {view === 'adminLogin' && <AdminLogin onNavigate={navigate} setUser={setUser} />}

      {view === 'adminDashboard' && user && (
        <AdminLayout activeView={adminView} onViewChange={handleAdminViewChange} onLogout={handleLogout} user={user}>
          
          {adminView === 'dashboard' && <AdminDashboard setAdminView={handleAdminViewChange} user={user} />}
          
          {adminView === 'jobs' && (
            <AdminJobs 
              setAdminView={handleAdminViewChange} 
              user={user} 
              showToast={showToast} 
            />
          )}
          
          {adminView === 'createJob' && (
            <AdminCreateJob 
              setAdminView={handleAdminViewChange} 
              user={user} 
              showToast={showToast} 
              jobToEdit={selectedJob} 
            />
          )}
          
          {adminView === 'candidates' && <AdminCandidates user={user} />}
          {adminView === 'profile' && <AdminProfile user={user} showToast={showToast} setUser={setUser} />}
        </AdminLayout>
      )}
    </div>
  );
}