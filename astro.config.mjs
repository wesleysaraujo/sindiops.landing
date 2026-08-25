// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// Landing 100% estática (SEO): todas as páginas são pré-renderizadas em HTML.
// O adapter Node existe só para o endpoint POST /waitlist (prerender = false).
export default defineConfig({
  site: 'https://sindiops.com.br',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
  },
});
