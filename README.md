# SindiOps — Landing de acesso antecipado

Landing estática (SEO-first) construída com **Astro 5 + Tailwind 4**. O HTML sai
pronto do build; o único código server-side é o endpoint `POST /waitlist`.

## Rodar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:4321
npm run build      # build de produção (dist/)
npm run preview    # serve o build (páginas estáticas + endpoint /waitlist)
```

Em produção: `node dist/server/entry.mjs` (adapter Node standalone; use `PORT`/`HOST`).

## Onde ficam os cadastros

Cada envio do formulário é enviado para API do sindiops, que grava no banco de dados. O endpoint é `POST /api/leads`

## Placeholders pendentes

- `public/video/demo.mp4` — vídeo de 15s do herói "Veja funcionando"
  (roteiro no comentário em `src/pages/index.astro`)
- `public/img/demo-poster.svg` — trocar por um frame real do vídeo
- OG image (`og:image`) — print da tela de consulta com a citação aberta
- Página de política de privacidade (link previsto no copy do rodapé; ver README de decisões)

## Arquitetura de design

- Tokens de cor e tipografia: `src/styles/global.css` (arquivo único)
- Fontes self-hosted em `public/fonts` (Besley, Atkinson Hyperlegible, Courier Prime)
- Sem bibliotecas de animação: só CSS + IntersectionObserver, com
  `prefers-reduced-motion` respeitado (inclusive pausando o vídeo em loop)
