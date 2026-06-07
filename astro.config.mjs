// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en", "pt"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [react(), clerk()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});