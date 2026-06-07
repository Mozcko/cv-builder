import React from 'react';
import { Show } from '@clerk/astro/react';
import { locales } from '../../i18n/locales';

export default function HeroActions({ lang = 'es' }: { lang?: string }) {
  const t = locales[lang as keyof typeof locales]?.ui || locales.es.ui;
  const langPrefix = lang === 'es' ? '' : `/${lang}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Show when="signed-in">
        <a
          href={`${langPrefix}/app/dashboard`}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:bg-emerald-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {t.nav.dashboard}
        </a>
      </Show>

      <Show when="signed-out">
        <a
          href={`${langPrefix}/app/editor`}
          className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 hover:bg-blue-500"
        >
          {t.hero.cta}
        </a>
      </Show>

      <a
        href="#features"
        className="rounded-xl border border-slate-700 bg-slate-800 px-8 py-4 text-center text-lg font-bold text-white transition-all hover:bg-slate-700"
      >
        {t.nav.features}
      </a>
    </div>
  );
}
