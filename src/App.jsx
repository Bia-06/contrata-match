import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, X } from 'lucide-react';

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

// Componentes Layout Global
import { Footer } from './components/layout/Footer';

// Componente PWA
import { PwaupdatePrompt } from './components/PwaupdatePrompt';

// Serviços
import { authService } from './pages/admin/services/authService';

// --- Textos Legais ---
const LEGAL_CONTENT = {
  terms: {
    title: "Termos de Uso",
    text: `Bem-vindo ao ContrataMatch. Ao utilizar nossa plataforma, você concorda com os seguintes termos:

1. O ContrataMatch é um intermediário digital que conecta candidatos a oportunidades no setor gastronômico.
2. Não garantimos a contratação efetiva, pois a decisão final cabe inteiramente às empresas anunciantes.
3. Todas as informações cadastradas (currículos e vagas) devem ser verdadeiras e atualizadas.
4. É estritamente proibido o uso da plataforma para fins ilícitos, discriminatórios ou ofensivos.
5. O usuário é responsável pela segurança de suas credenciais de acesso.`
  },
  privacy: {
    title: "Política de Privacidade",
    text: `Sua privacidade é fundamental para nós. Esta política descreve como tratamos seus dados:

1. Coleta de Dados: Coletamos apenas informações estritamente necessárias para o processo de recrutamento (nome, e-mail, telefone, histórico profissional e cidade).
2. Compartilhamento: Seus dados são compartilhados exclusivamente com as empresas nas quais você opta por se candidatar. Não vendemos seus dados para terceiros.
3. Segurança: Utilizamos práticas de segurança modernas para proteger suas informações no banco de dados.
4. Direitos: Você pode solicitar a visualização, correção ou exclusão completa dos seus dados a qualquer momento entrando em contato com nosso suporte.`
  },
  cookies: {
    title: "Política de Cookies",
    text: `Utilizamos cookies para melhorar sua experiência de navegação:

1. Cookies Essenciais: Necessários para o funcionamento do site, como manter você logado na área administrativa.
2. Cookies de Desempenho: Nos ajudam a entender como os usuários navegam no site para melhorarmos nossos serviços (dados anônimos).
3. Controle: Você pode desativar os cookies nas configurações do seu navegador a qualquer momento, porém algumas funcionalidades do site podem não operar corretamente.`
  }
};

const LegalModal = ({ type, onClose }) => {
  if (!type || !LEGAL_CONTENT[type]) return null;
  const content = LEGAL_CONTENT[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-emerald-100 animate-[scaleIn_0.3s_ease-out]">

        <div className="flex justify-between items-center p-8 border-b border-emerald-50">
          <h2 className="text-3xl font-serif font-bold text-emerald-950">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 hover:bg-orange-100 text-stone-500 hover:text-orange-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="prose prose-lg prose-emerald text-emerald-900/80 whitespace-pre-line leading-relaxed">
            {content.text}
          </div>
        </div>

        <div className="p-6 border-t border-emerald-50 bg-stone-50 rounded-b-[2rem] flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-emerald-900 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Helper: detecta se está rodando como PWA instalado ──
const isRunningAsPWA = () => {
  // Display-mode standalone = PWA instalado (Android/Desktop)
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  // navigator.standalone = PWA instalado no iOS
  if (window.navigator.standalone === true) return true;
  return false;
};

export default function App() {
  const getInitialView = () => {
    const params = new URLSearchParams(window.location.search);

    // Se tem ?restaurante=... abre a lista (vem de link compartilhado)
    if (params.get('restaurante')) return 'restaurants';

    // Se está rodando como PWA instalado, vai direto pro fluxo admin
    // (o useEffect de recoverSession decide se vai pro login ou dashboard)
    if (isRunningAsPWA()) return 'adminLogin';

    // Navegador normal: landing page
    return 'landing';
  };

  const [view, setView] = useState(getInitialView);
  const [adminView, setAdminView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [toast, setToast] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

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
          // Se tem sessão ativa, vai direto pro dashboard
          // (independente se está em landing, login ou PWA)
          if (view === 'landing' || view === 'adminLogin') setView('adminDashboard');
        }
      } catch (err) {
        console.error('Sessão não recuperada:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };
    recoverSession();
  }, []);

  useEffect(() => {
    if (!isCheckingSession && view === 'adminDashboard' && !user) {
      setView('adminLogin');
    }
  }, [view, user, isCheckingSession]);

  useEffect(() => {
    const { data } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        // Quando faz logout em PWA, vai pro login. Em navegador, vai pra landing.
        setView(isRunningAsPWA() ? 'adminLogin' : 'landing');
        setAdminView('dashboard');
      }
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  const navigate = (target, params = null) => {
    if (params) setSelectedJob(params);
    setView(target);
    setIsMenuOpen(false);

    if (target !== 'restaurants') {
      window.history.pushState({}, '', window.location.pathname);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminViewChange = (viewName, data = null) => {
    setAdminView(viewName);
    if (viewName === 'createJob') setSelectedJob(data);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    // Em PWA, volta pra login. Em navegador, volta pra landing.
    navigate(isRunningAsPWA() ? 'adminLogin' : 'landing');
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

  const pageProps = {
    onNavigate: navigate,
    onOpenModal: setActiveModal
  };

  const isPublicPage = ['landing', 'jobs', 'restaurants', 'about', 'apply', 'adminLogin'].includes(view);

  return (
    <div className="antialiased text-emerald-950 font-sans flex flex-col min-h-screen">

      {/* Aviso de nova versão (só aparece quando há update) */}
      <PwaupdatePrompt />

      {activeModal && <LegalModal type={activeModal} onClose={() => setActiveModal(null)} />}

      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-[float_0.5s_ease-out]">
          <div className="bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-800">
            <CheckCircle size={20} className="text-emerald-400" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}

      <div className="flex-1">
        {view === 'landing' && (
          <LandingPage
            {...pageProps}
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            isMenuOpen={isMenuOpen}
          />
        )}

        {view === 'jobs' && <JobsList {...pageProps} filterCompanyId={selectedJob?.filterCompanyId} />}
        {view === 'restaurants' && <RestaurantsList {...pageProps} />}
        {view === 'about' && <AboutPage {...pageProps} />}
        {view === 'apply' && <ApplyForm selectedJob={selectedJob} {...pageProps} showToast={showToast} />}

        {view === 'adminLogin' && <AdminLogin {...pageProps} setUser={setUser} />}

        {view === 'adminDashboard' && user && (
          <AdminLayout activeView={adminView} onViewChange={handleAdminViewChange} onLogout={handleLogout} user={user}>
            {adminView === 'dashboard' && <AdminDashboard setAdminView={handleAdminViewChange} user={user} />}
            {adminView === 'jobs' && <AdminJobs setAdminView={handleAdminViewChange} user={user} showToast={showToast} />}
            {adminView === 'createJob' && <AdminCreateJob setAdminView={handleAdminViewChange} user={user} showToast={showToast} jobToEdit={selectedJob} />}
            {adminView === 'candidates' && <AdminCandidates user={user} />}
            {adminView === 'profile' && <AdminProfile user={user} showToast={showToast} setUser={setUser} />}
          </AdminLayout>
        )}
      </div>

      {/* Footer só aparece em modo navegador, não no PWA */}
      {isPublicPage && !isRunningAsPWA() && <Footer onNavigate={navigate} onOpenModal={setActiveModal} />}
    </div>
  );
}