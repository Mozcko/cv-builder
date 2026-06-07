import React from 'react';
import { SignIn } from '@clerk/astro/react';

export const LoginCard = () => {
  return (
    <div className="flex w-full justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full flex justify-center',
            card: 'bg-slate-800 border border-slate-700 shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton: 'bg-white hover:bg-gray-100 text-gray-800 border-none',
            dividerLine: 'bg-slate-600',
            dividerText: 'text-slate-500',
            formFieldLabel: 'text-slate-300 font-bold text-xs uppercase',
            formFieldInput:
              'bg-slate-900 border-slate-600 text-white focus:ring-2 focus:ring-blue-500',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-bold',
            footerActionText: 'text-slate-400',
            footerActionLink: 'text-blue-400 hover:text-blue-300',
          },
        }}
        fallbackRedirectUrl="/app/dashboard"
      />
    </div>
  );
};
