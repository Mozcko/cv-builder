import React from 'react';

const languages = [
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
];

export default function LanguagePicker({ currentLang }: { currentLang: string }) {
  const handleLanguageChange = (langCode: string) => {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `cvstudio_locale=${langCode}; path=/; max-age=31536000; SameSite=Lax`;

    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(Boolean);

    let newPath = pathname;
    const currentLocalePrefix = ['en', 'pt'].includes(pathParts[0]) ? pathParts[0] : null;

    if (langCode === 'es') {
      if (currentLocalePrefix) {
        newPath = '/' + pathParts.slice(1).join('/');
      }
    } else {
      if (currentLocalePrefix) {
        newPath = `/${langCode}/${pathParts.slice(1).join('/')}`;
      } else {
        newPath = `/${langCode}${pathname === '/' ? '' : pathname}`;
      }
    }

    // eslint-disable-next-line react-hooks/immutability
    window.location.href = newPath || '/';
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-slate-800/50 p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
            currentLang === lang.code
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
          title={lang.label}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  );
}
