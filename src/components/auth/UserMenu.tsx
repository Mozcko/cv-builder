import React from 'react';
import { UserButton, Show } from '@clerk/astro/react';
import { locales } from '../../i18n/locales';
export default function UserMenu({
  lang = 'es',
  isPro = false,
}: {
  lang?: string;
  isPro?: boolean;
}) {
  const t = locales[lang as keyof typeof locales]?.ui.nav || locales.es.ui.nav;
  const langPrefix = lang === 'es' ? '' : `/${lang}`;

  return (
    <div className="flex items-center gap-4">
      <Show when="signed-in">
        {!isPro && (
          <a
            href={`${langPrefix}/pricing`}
            className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:from-amber-400 hover:to-orange-500 hover:shadow-orange-500/20 active:scale-95 md:flex"
          >
            <span>{t.upgrade}</span>
          </a>
        )}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: 'h-9 w-9 border-2 border-slate-600',
              userButtonPopoverCard: 'bg-slate-800 border border-slate-700 shadow-xl',
              userButtonPopoverActionButtonText: 'text-slate-300',
              userButtonPopoverActionButtonIcon: 'text-slate-400',
              userButtonPopoverFooter: 'hidden',
            },
          }}
          userProfileProps={{
            appearance: {
              elements: {
                card: 'bg-slate-800 border border-slate-700',
                headerTitle: 'text-white',
                headerSubtitle: 'text-slate-400',
                navbar: 'bg-slate-900 border-r border-slate-700',
                breadcrumbsItem: 'text-slate-400',
                breadcrumbsItemActive: 'text-white',
              },
            },
          }}
        />
      </Show>
      <Show when="signed-out">
        <a
          href={`${langPrefix}/sign-in`}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
        >
          {t.signIn}
        </a>
      </Show>
    </div>
  );
}
