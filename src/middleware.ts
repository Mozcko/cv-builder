import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';
import { defineMiddleware, sequence } from 'astro/middleware';

const isPublicRoute = createRouteMatcher([
  '/',
  '/en',
  '/pt',
  '/en/',
  '/pt/',
  '/pricing',
  '/en/pricing',
  '/pt/pricing',
  '/sign-in(.*)',
  '/en/sign-in(.*)',
  '/pt/sign-in(.*)',
  '/sign-up(.*)',
  '/en/sign-up(.*)',
  '/pt/sign-up(.*)',
  '/app/editor(.*)',
  '/en/app/editor(.*)',
  '/pt/app/editor(.*)',
]);

const i18nMiddleware = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // Supported locales
  const locales = ['es', 'en', 'pt'];
  const defaultLocale = 'es';
  const prefixedLocales = ['en', 'pt'];

  // 1. Skip middleware for API, internal routes, assets, and auth pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_astro') ||
    pathname.includes('.') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up')
  ) {
    return next();
  }

  // 2. Identify current locale from URL
  const firstSegment = pathname.split('/')[1];
  const isDefaultPath = !prefixedLocales.includes(firstSegment);

  // 3. Determine preferred locale (Cookie > Browser > Default)
  const cookieLocale = cookies.get('cvstudio_locale')?.value;
  let preferred = cookieLocale;

  if (!preferred || !locales.includes(preferred)) {
    preferred = context.preferredLocale || defaultLocale;
  }

  // 4. Redirection Logic
  // Only redirect if visiting a default path (no prefix) but preference is for a prefixed locale
  if (isDefaultPath && prefixedLocales.includes(preferred)) {
    const newPath = `/${preferred}${pathname === '/' ? '/' : pathname}`;

    // Prevent redirecting if we are already at the target path (should not happen with isDefaultPath check)
    if (pathname !== newPath) {
      return redirect(newPath, 302);
    }
  }

  return next();
});

export const onRequest = sequence(
  clerkMiddleware((auth, context, next) => {
    const { userId, redirectToSignIn } = auth();

    if (!userId && !isPublicRoute(context.request)) {
      return redirectToSignIn({ returnBackUrl: context.request.url });
    }
    return next();
  }),
  i18nMiddleware
);
