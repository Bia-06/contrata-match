// src/components/PWAUpdatePrompt.jsx
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Wifi, WifiOff } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r);
      // Checa por updates a cada 1 hora
      r && setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.error('Erro no Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] max-w-sm animate-[fadeInUp_0.3s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${needRefresh ? 'bg-orange-100' : 'bg-emerald-100'}`}>
            {needRefresh ? (
              <RefreshCw size={20} className="text-orange-600" />
            ) : (
              <WifiOff size={20} className="text-emerald-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {needRefresh ? (
              <>
                <h3 className="font-bold text-emerald-950 mb-1">Nova versão disponível</h3>
                <p className="text-sm text-emerald-900/60 mb-3">
                  Clique para atualizar e obter as últimas melhorias.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateServiceWorker(true)}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Atualizar agora
                  </button>
                  <button
                    onClick={close}
                    className="px-3 py-2 text-stone-500 hover:text-stone-700 text-sm font-medium"
                  >
                    Depois
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-emerald-950 mb-1">App pronto para uso offline</h3>
                <p className="text-sm text-emerald-900/60">
                  Você já pode acessar o ContrataMatch mesmo sem internet.
                </p>
              </>
            )}
          </div>

          <button
            onClick={close}
            className="p-1 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
          >
            <X size={18} className="text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};