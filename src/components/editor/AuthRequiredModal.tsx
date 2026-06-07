import React from 'react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'es' | 'en' | 'pt';
  title?: string;
  description?: string;
  mode?: 'auth' | 'upgrade';
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  lang,
  title,
  description,
  mode = 'auth',
}: AuthRequiredModalProps) {
  if (!isOpen) return null;

  const defaultTitle = mode === 'upgrade' ? 'Upgrade' : 'Auth Required';
  const loginText = lang === 'es' ? 'Entrar' : 'Login';
  const langPrefix = lang === 'es' ? '' : `/${lang}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-white">{title || defaultTitle}</h2>
        <p className="mb-6 text-sm text-slate-400">{description}</p>

        <div className="flex flex-col gap-3">
          {mode === 'upgrade' ? (
            <a
              href={`${langPrefix}/pricing`}
              className="rounded-xl bg-amber-500 p-3 text-center font-bold text-white"
            >
              Upgrade
            </a>
          ) : (
            <a
              href="/sign-in"
              className="rounded-xl bg-blue-600 p-3 text-center font-bold text-white"
            >
              {loginText}
            </a>
          )}
          <button onClick={onClose} className="text-sm text-slate-500">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
