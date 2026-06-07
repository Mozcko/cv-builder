import React from 'react';
import { locales } from '../../i18n/locales';

const getFeatures = (lang: string) => {
  const t =
    locales[lang as keyof typeof locales]?.ui.features.items || locales.es.ui.features.items;

  return [
    {
      title: t.ai.title,
      description: t.ai.description,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.456-2.454L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      ),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t.ats.title,
      description: t.ats.description,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75l3 3 6-6M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0z"
          />
        </svg>
      ),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: t.editor.title,
      description: t.editor.description,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.644C3.323 8.19 7.043 5.5 11 5.5s7.677 2.69 8.964 6.178a1.012 1.012 0 010 .644C18.677 15.81 14.957 18.5 11 18.5s-7.677-2.69-8.964-6.178z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: t.coverLetter.title,
      description: t.coverLetter.description,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: t.multilingual.title,
      description: t.multilingual.description,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
          />
        </svg>
      ),
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
    {
      title: t.export.title,
      description: t.export.description,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      ),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];
};

export default function FeaturesSection({ lang = 'es' }: { lang?: string }) {
  const t = locales[lang as keyof typeof locales]?.ui.features || locales.es.ui.features;
  const features = getFeatures(lang);

  return (
    <section id="features" className="mt-32 w-full max-w-6xl border-t border-white/5 py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">{t.title}</h2>
        <p className="mx-auto max-w-2xl text-slate-400">{t.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-8 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5"
          >
            <div
              className={`h-12 w-12 rounded-xl ${feature.bgColor} ${feature.color} mb-6 flex items-center justify-center transition-transform group-hover:scale-110`}
            >
              {feature.icon}
            </div>
            <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
