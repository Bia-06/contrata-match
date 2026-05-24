// src/components/NotificationButton.jsx
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Loader2, X, Check } from 'lucide-react';
import { pushService } from '../services/pushService';

export const NotificationButton = ({ user }) => {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const init = async () => {
      const isSupported = pushService.isSupported();
      setSupported(isSupported);
      if (!isSupported) return;

      setPermission(pushService.getPermissionStatus());
      setSubscribed(await pushService.isSubscribed());
    };
    init();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await pushService.subscribe(user, user.companyId);
      setSubscribed(true);
      setPermission('granted');
      showToast('Notificações ativadas! Você receberá alertas de novos candidatos.');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      if (err.message?.includes('negada')) {
        showToast('Você precisa permitir notificações nas configurações do navegador.', 'error');
      } else {
        showToast('Erro ao ativar notificações: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await pushService.unsubscribe();
      setSubscribed(false);
      showToast('Notificações desativadas.');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast('Erro ao desativar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <>
      {/* Botão no header */}
      <button
        onClick={() => setShowModal(true)}
        title={subscribed ? 'Notificações ativas' : 'Ativar notificações'}
        className={`relative p-2 rounded-xl transition-all ${
          subscribed
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
        }`}
      >
        {subscribed ? <BellRing size={20} /> : <Bell size={20} />}
        {subscribed && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        )}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[1.75rem] w-full max-w-md shadow-2xl animate-[scaleIn_0.3s_ease-out] overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-6 text-center relative">
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                {subscribed ? <BellRing size={28} className="text-white" /> : <Bell size={28} className="text-white" />}
              </div>
              <h2 className="text-xl font-bold text-white">
                {subscribed ? 'Notificações Ativas' : 'Ativar Notificações'}
              </h2>
              <p className="text-emerald-100/80 text-sm mt-1">
                {subscribed
                  ? 'Você receberá alertas de novos candidatos'
                  : 'Receba alertas em tempo real'}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {permission === 'denied' ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-sm text-red-700 mb-2 font-medium">Permissão bloqueada</p>
                  <p className="text-xs text-red-600/80">
                    Você bloqueou as notificações para este site. Para reativar, vá nas configurações do navegador → Permissões do site → Notificações → Permitir.
                  </p>
                </div>
              ) : subscribed ? (
                <>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                    <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-emerald-800">
                      Sempre que um candidato enviar uma candidatura para suas vagas, você receberá uma notificação push.
                    </div>
                  </div>

                  <button onClick={handleUnsubscribe} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors disabled:opacity-60">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <BellOff size={18} />}
                    Desativar notificações
                  </button>
                </>
              ) : (
                <>
                  <ul className="space-y-2.5 text-sm text-emerald-900/80">
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      Receba alertas instantâneos de novos candidatos
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      Funciona mesmo com o site fechado
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      Você pode desativar quando quiser
                    </li>
                  </ul>

                  <button onClick={handleSubscribe} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-emerald-600/20">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Bell size={18} />}
                    Ativar notificações
                  </button>

                  <p className="text-xs text-stone-400 text-center pt-2">
                    Em iPhones, é necessário instalar o app primeiro (Adicionar à Tela de Início).
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[110] animate-[fadeIn_0.3s_ease-out]">
          <div className={`px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium text-white ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-900'
          }`}>
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
};