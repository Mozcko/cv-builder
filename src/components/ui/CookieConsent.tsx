import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('cvstudio_consent');
    if (!consent) {
      // Delay visibility slightly for smoother entrance
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cvstudio_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-[100] px-4 pb-4 md:px-6 md:pb-6">
      <div className="pointer-events-auto mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md md:p-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1 text-center md:text-left">
              <h3 className="mb-1 text-lg font-bold text-white">🍪 Respetamos tu privacidad</h3>
              <p className="text-sm text-slate-400">
                Utilizamos cookies para mejorar tu experiencia y analizar el tráfico de forma
                anónima. Al continuar navegando, aceptas nuestra{' '}
                <a href="/privacy" className="text-blue-400 underline hover:text-blue-300">
                  política de privacidad
                </a>
                .
              </p>
            </div>

            <div className="flex w-full shrink-0 items-center gap-3 md:w-auto">
              <button
                onClick={handleAccept}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 md:w-auto"
              >
                Entendido
              </button>
            </div>
          </div>

          {/* Decorative progress bar animation */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-blue-600 to-purple-600 opacity-20"></div>
        </div>
      </div>
    </div>
  );
}
