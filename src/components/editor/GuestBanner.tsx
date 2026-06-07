import React from 'react';

interface GuestBannerProps {
  onSignUp: () => void;
  lang: 'es' | 'en' | 'pt';
}

export default function GuestBanner({ onSignUp, lang }: GuestBannerProps) {
  const text = {
    es: 'Estás editando como invitado. Tu progreso se guarda localmente.',
    en: 'You are editing as a guest. Your progress is saved locally.',
    pt: 'Você está editando como convidado. Seu progresso é salvo localmente.',
  }[lang];

  const action = {
    es: 'Registrarme para guardar en la nube',
    en: 'Sign up to sync to the cloud',
    pt: 'Registrar para salvar na nuvem',
  }[lang];

  return (
    <div className="flex items-center justify-center gap-4 border-b border-blue-500/20 bg-blue-600/10 px-4 py-2 text-xs">
      <span className="font-medium text-blue-400">{text}</span>
      <button
        onClick={onSignUp}
        className="font-bold text-blue-400 underline transition-colors hover:text-blue-300"
      >
        {action}
      </button>
    </div>
  );
}
