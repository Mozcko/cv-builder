import React, { useState } from 'react';
import { useAuth } from '@clerk/astro/react';
import { api } from '../../lib/api';
import { useUiTranslations } from '../../i18n/utils';
import type { locales } from '../../i18n/locales';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: keyof typeof locales;
}

export default function UpgradeModal({ isOpen, onClose, lang = 'es' }: UpgradeModalProps) {
  const { getToken } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<'7' | '30' | 'lifetime' | null>(null);
  const t = useUiTranslations(lang);

  const pricingTranslations = (t('pricing') || {}) as Record<string, unknown>;
  const plans = (pricingTranslations.plans || {}) as Record<string, any>;

  const tiers = [
    {
      id: '7',
      name: plans.sprint?.name,
      duration: plans.sprint?.duration,
      price: plans.sprint?.price,
      description: ((plans.sprint?.features as string[]) || []).join('. '),
      popular: false,
    },
    {
      id: '30',
      name: plans.active?.name,
      duration: plans.active?.duration,
      price: plans.active?.price,
      description: ((plans.active?.features as string[]) || []).join('. '),
      popular: true,
    },
    {
      id: 'lifetime',
      name: plans.lifetime?.name,
      duration: plans.lifetime?.duration,
      price: plans.lifetime?.price,
      description: ((plans.lifetime?.features as string[]) || []).join('. '),
      popular: false,
    },
  ] as const;

  const handleCheckout = async (planType: '7' | '30' | 'lifetime') => {
    setLoadingPlan(planType);
    try {
      const token = await getToken();
      const res = await api.createCheckoutSession(planType, token);
      if (res && res.url) {
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = res.url;
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      setLoadingPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="bg-linear-to-br from-purple-600 to-indigo-600 px-6 py-10 text-center text-white">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            🚀
          </div>
          <h2 className="mb-2 text-3xl font-bold">Plan Pro</h2>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  tier.popular
                    ? 'z-10 scale-105 border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <p className="text-sm text-slate-400">{tier.duration}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                </div>

                <p className="mb-8 flex-1 text-sm leading-relaxed text-slate-300">
                  {tier.description}
                </p>

                <button
                  disabled={loadingPlan !== null}
                  onClick={() => handleCheckout(tier.id)}
                  className={`mt-auto flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold transition-all ${
                    tier.popular ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                  }`}
                >
                  {loadingPlan === tier.id ? '...' : 'Select'}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
