// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
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
  // O sitemap sai das rotas no build, e não de um arquivo em `public/`.
  // Escrito à mão ele envelhece calado: as páginas de termos e privacidade
  // nasceram e ficaram fora dele por semanas, sem erro nenhum que
  // denunciasse. Aqui, página nova entra sozinha.
  //
  // Sem `lastmod`: ele viria da data do build e mudaria a cada deploy, mesmo
  // quando nada no texto mudou — data de alteração que não corresponde a
  // alteração nenhuma é pior que data nenhuma, porque o robô aprende a
  // ignorá-la.
  integrations: [
    sitemap({
      // `/waitlist` é o endpoint POST do formulário, não uma página: no
      // sitemap ele mandaria o robô rastrear uma URL que só responde a POST.
      filter: (page) => !page.includes('/waitlist'),
      // Sem a barra final, para bater com o `canonical` que cada página
      // declara. As duas formas servem o mesmo HTML, mas sitemap e canonical
      // apontando endereços diferentes é o tipo de ruído que faz o robô
      // gastar rastreio decidindo qual das duas vale.
      serialize: (item) => ({
        ...item,
        url: item.url.replace(/(.+)\/$/, '$1'),
      }),
    }),
  ],
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
