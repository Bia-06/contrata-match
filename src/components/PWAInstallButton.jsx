// src/components/PWAInstallButton.jsx
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta iOS (Safari no iOS não dispara beforeinstallprompt)
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(isIos && !isStandalone);

    // Captura o evento de instalação (Chrome, Edge, Android)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Só mostra se o usuário não dispensou antes
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Mostra prompt do iOS após 30s (se não foi dispensado)
    if (isIos && !isStandalone) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 30000);
        return () => clearTimeout(timer);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('PWA install:', outcome);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  // Prompt para iOS (instruções manuais)
  if (isIOS) {
    return (
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[200] animate-[fadeInUp_0.3s_ease-out]">
        <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-5">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Download size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-950">Instale o ContrataMatch</h3>
              <p className="text-sm text-emerald-900/60 mt-1">
                Toque em <span className="inline-block px-1.5 py-0.5 bg-stone-100 rounded text-xs font-mono">⎙</span> e depois em <strong>"Adicionar à Tela de Início"</strong>
              </p>
            </div>
            <button onClick={dismiss} className="p-1 hover:bg-stone-100 rounded-lg shrink-0">
              <X size={18} className="text-stone-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt para Android/Desktop (instalação automática)
  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[200] animate-[fadeInUp_0.3s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Download size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-emerald-950 mb-1">Instalar ContrataMatch</h3>
            <p className="text-sm text-emerald-900/60 mb-3">
              Acesse mais rápido e receba notificações de novos candidatos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-2 text-stone-500 hover:text-stone-700 text-sm font-medium"
              >
                Agora não
              </button>
            </div>
          </div>
          <button onClick={dismiss} className="p-1 hover:bg-stone-100 rounded-lg shrink-0">
            <X size={18} className="text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
};