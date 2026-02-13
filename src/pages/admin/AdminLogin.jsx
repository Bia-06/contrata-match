// src/pages/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { Check, ArrowLeft, Lock, Mail, Building2, User, FileText, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { ModernLogo } from '../../components/ui/ModernLogo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from './services/authService';

export const AdminLogin = ({ onNavigate, setUser, onOpenModal }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cnpj, setCnpj] = useState('');

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regCompanyName, setRegCompanyName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleCnpjChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    setCnpj(value);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateCnpj = (raw) => {
    const d = raw.replace(/\D/g, '');
    if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
    const calc = (str, w) => {
      const s = w.reduce((a, wt, i) => a + parseInt(str[i]) * wt, 0);
      const r = s % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return (
      parseInt(d[12]) === calc(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) &&
      parseInt(d[13]) === calc(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    );
  };

  // ═══════════ LOGIN ═══════════
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errs = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Informe seu email.';
    else if (!isValidEmail(loginEmail)) errs.loginEmail = 'Email inválido.';
    if (!loginPassword) errs.loginPassword = 'Informe sua senha.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setIsLoading(true);
    try {
      const data = await authService.login({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (!remember) {
        sessionStorage.setItem('contrata_no_persist', 'true');
      } else {
        sessionStorage.removeItem('contrata_no_persist');
      }

      const company = await authService.getCurrentCompany();

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: company?.name || data.user.user_metadata?.full_name || 'Usuário',
        company: company?.name || '',
        companyId: company?.id || null,
      });
      onNavigate('adminDashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════ CADASTRO ═══════════
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errs = {};
    if (!regCompanyName.trim()) errs.companyName = 'Nome do restaurante é obrigatório.';
    if (!cnpj.trim()) errs.cnpj = 'CNPJ é obrigatório.';
    else if (!validateCnpj(cnpj)) errs.cnpj = 'CNPJ inválido.';
    if (!regOwnerName.trim()) errs.ownerName = 'Informe seu nome.';
    if (!regEmail.trim()) errs.email = 'Email é obrigatório.';
    else if (!isValidEmail(regEmail)) errs.email = 'Email inválido.';
    if (!regPassword) errs.password = 'Crie uma senha.';
    else if (regPassword.length < 8) errs.password = 'Mínimo 8 caracteres.';
    if (regPassword !== regConfirmPassword) errs.confirmPassword = 'As senhas não coincidem.';
    if (!agreed) errs.terms = 'Aceite os termos para continuar.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setIsLoading(true);
    try {
      const result = await authService.register({
        email: regEmail.trim(),
        password: regPassword,
        companyName: regCompanyName.trim(),
        cnpj: cnpj.replace(/\D/g, ''),
        ownerName: regOwnerName.trim(),
      });

      if (result.needsEmailConfirmation) {
        setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.');
        switchTab('login');
      } else {
        setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.company?.name || regCompanyName,
          company: result.company?.name || regCompanyName,
          companyId: result.company?.id || null,
        });
        onNavigate('adminDashboard');
      }
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('Este email já está cadastrado.');
      } else {
        setError(err.message || 'Erro ao cadastrar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════ ESQUECEU A SENHA ═══════════
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (!forgotEmail.trim()) { setFieldErrors({ forgotEmail: 'Informe seu email.' }); return; }
    if (!isValidEmail(forgotEmail)) { setFieldErrors({ forgotEmail: 'Email inválido.' }); return; }

    setIsLoading(true);
    try {
      await authService.resetPassword(forgotEmail.trim());
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada e spam.');
    } catch (err) {
      setError(err.message || 'Erro ao enviar email.');
    } finally {
      setIsLoading(false);
    }
  };

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
        <AlertTriangle size={12} /> {fieldErrors[name]}
      </p>
    ) : null;

  const TogglePassword = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 bottom-3 text-emerald-900/30 hover:text-emerald-900/60 transition-colors z-10"
      tabIndex={-1}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] px-6 font-sans relative overflow-hidden">
      <div className="blob blob-1 opacity-40"></div>
      <div className="blob blob-2 opacity-40"></div>
      <div className="blob blob-3 opacity-30"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/50 shadow-2xl shadow-emerald-900/10 relative z-10 animate-[fadeInUp_0.5s_ease-out_forwards]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-sm mb-4">
            <ModernLogo className="scale-110 origin-center" />
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl text-sm mb-6 bg-red-50 text-red-700 border border-red-100 animate-[fadeIn_0.3s_ease-out]">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 p-4 rounded-2xl text-sm mb-6 bg-emerald-50 text-emerald-700 border border-emerald-100 animate-[fadeIn_0.3s_ease-out]">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ABAS */}
        {activeTab !== 'forgot' && (
          <div className="relative flex border-b border-emerald-900/10 mb-8">
            <button type="button" onClick={() => switchTab('login')}
              className={`flex-1 pb-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'login' ? 'text-emerald-900' : 'text-emerald-900/40 hover:text-emerald-900/60'}`}>
              LOGIN
            </button>
            <button type="button" onClick={() => switchTab('register')}
              className={`flex-1 pb-4 text-sm font-bold tracking-wide transition-colors ${activeTab === 'register' ? 'text-emerald-900' : 'text-emerald-900/40 hover:text-emerald-900/60'}`}>
              CADASTRO
            </button>
            <div className={`absolute bottom-0 h-0.5 bg-emerald-600 transition-all duration-300 w-1/2 rounded-full ${activeTab === 'login' ? 'left-0' : 'left-1/2'}`}></div>
          </div>
        )}

        {/* ═══ LOGIN ═══ */}
        {activeTab === 'login' && (
          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-serif font-bold text-emerald-950">Bem-vindo de volta</h2>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Mail size={18} /></div>
                  <Input label="Email Corporativo" type="email" placeholder="gerencia@restaurante.com" required
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ paddingLeft: '3rem' }} />
                </div>
                <FieldError name="loginEmail" />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Lock size={18} /></div>
                  <Input label="Senha" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" required
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }} />
                  <TogglePassword show={showLoginPass} onToggle={() => setShowLoginPass(!showLoginPass)} />
                </div>
                <FieldError name="loginPassword" />
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setRemember(!remember)}>
                  <div className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${remember ? 'bg-emerald-600 border-emerald-600' : 'border-emerald-200 bg-white group-hover:border-emerald-400'}`}>
                    {remember && <Check size={14} className="text-white stroke-[3]" />}
                  </div>
                  <span className="text-emerald-900/60 font-medium group-hover:text-emerald-800 transition-colors">Lembrar-me</span>
                </label>
                <button type="button" onClick={() => switchTab('forgot')}
                  className="text-orange-600 font-bold hover:text-orange-700 transition-colors text-xs uppercase tracking-wide">
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full shadow-emerald-900/20 shadow-xl py-4 text-base mt-6" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Entrando...
                </span>
              ) : 'Entrar no Painel'}
            </Button>
          </form>
        )}

        {/* ═══ CADASTRO ═══ */}
        {activeTab === 'register' && (
          <form className="space-y-5" onSubmit={handleRegister} noValidate>
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center mb-2">
                <h2 className="text-2xl font-serif font-bold text-emerald-950">Criar conta empresa</h2>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Building2 size={18} /></div>
                  <Input label="Nome do Restaurante" placeholder="Ex: Le Jardin Bistrô" required
                    value={regCompanyName} onChange={(e) => setRegCompanyName(e.target.value)}
                    style={{ paddingLeft: '3rem' }} />
                </div>
                <FieldError name="companyName" />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><FileText size={18} /></div>
                  <Input label="CNPJ" placeholder="00.000.000/0000-00" required
                    value={cnpj} onChange={handleCnpjChange} maxLength={18}
                    style={{ paddingLeft: '3rem' }} />
                </div>
                <FieldError name="cnpj" />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><User size={18} /></div>
                  <Input label="Seu Nome" placeholder="Nome do responsável" required
                    value={regOwnerName} onChange={(e) => setRegOwnerName(e.target.value)}
                    style={{ paddingLeft: '3rem' }} />
                </div>
                <FieldError name="ownerName" />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Mail size={18} /></div>
                  <Input label="Email Corporativo" type="email" placeholder="contato@empresa.com" required
                    value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: '3rem' }} />
                </div>
                <FieldError name="email" />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Lock size={18} /></div>
                  <Input label="Criar Senha" type={showRegPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" required
                    value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }} />
                  <TogglePassword show={showRegPass} onToggle={() => setShowRegPass(!showRegPass)} />
                </div>
                <FieldError name="password" />
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Lock size={18} /></div>
                  <Input label="Confirmar Senha" type={showRegConfirmPass ? 'text' : 'password'} placeholder="Repita a senha" required
                    value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }} />
                  <TogglePassword show={showRegConfirmPass} onToggle={() => setShowRegConfirmPass(!showRegConfirmPass)} />
                </div>
                <FieldError name="confirmPassword" />
              </div>

              {/* FIX: Links abrem modais de Termos e Privacidade */}
              <div>
                <div className="flex items-start gap-2 pt-2">
                  <div className={`w-5 h-5 mt-0.5 rounded-lg border transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${agreed ? 'bg-emerald-600 border-emerald-600' : 'border-emerald-200 bg-white'}`}
                    onClick={() => setAgreed(!agreed)}>
                    {agreed && <Check size={14} className="text-white stroke-[3]" />}
                  </div>
                  <p className="text-xs text-emerald-900/60 leading-tight">
                    Li e concordo com os{' '}
                    <button type="button" onClick={() => onOpenModal?.('terms')}
                      className="text-emerald-800 font-bold hover:underline">
                      Termos de Uso
                    </button>{' '}e{' '}
                    <button type="button" onClick={() => onOpenModal?.('privacy')}
                      className="text-emerald-800 font-bold hover:underline">
                      Política de Privacidade
                    </button>.
                  </p>
                </div>
                <FieldError name="terms" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full shadow-emerald-900/20 shadow-xl py-4 text-base mt-6" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Cadastrando...
                </span>
              ) : 'Cadastrar Empresa'}
            </Button>
          </form>
        )}

        {/* ═══ ESQUECEU A SENHA ═══ */}
        {activeTab === 'forgot' && (
          <form className="space-y-5" onSubmit={handleForgotPassword} noValidate>
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-orange-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-emerald-950">Recuperar senha</h2>
                <p className="text-sm text-emerald-900/50 mt-2 leading-relaxed">
                  Informe seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-4 bottom-3 text-emerald-900/30 pointer-events-none z-10"><Mail size={18} /></div>
                  <Input label="Email cadastrado" type="email" placeholder="seu@email.com" required
                    value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ paddingLeft: '3rem' }} />
                </div>
                <FieldError name="forgotEmail" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full shadow-emerald-900/20 shadow-xl py-4 text-base mt-6" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Enviando...
                </span>
              ) : 'Enviar link de recuperação'}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-emerald-900/5 text-center">
          {activeTab === 'forgot' ? (
            <button onClick={() => switchTab('login')}
              className="inline-flex items-center gap-2 text-sm text-emerald-900/40 hover:text-emerald-900 transition-colors font-medium group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao login
            </button>
          ) : (
            <button onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-sm text-emerald-900/40 hover:text-emerald-900 transition-colors font-medium group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao início
            </button>
          )}
        </div>
      </div>
    </div>
  );
};