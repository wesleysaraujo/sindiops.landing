// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Landing 100% estática (SEO): todas as páginas são pré-renderizadas em HTML.
// O adapter existe só para o endpoint POST /waitlist (prerender = false), que
// vira uma função serverless. É o adapter da Vercel, e não o Node: o de Node
// emite um servidor `dist/server/entry.mjs` que a plataforma não sabe iniciar
// — o deploy sobe e responde 404 até nos arquivos estáticos.
export default defineConfig({
  site: 'https://sindiops.com.br',
  output: 'static',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
