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

## Páginas legais

`/termos` e `/privacidade` são as **únicas páginas renderizadas por
requisição** (`prerender = false`). A identificação do controlador dos dados —
razão social, CNPJ, endereço, encarregado — vem do app por
`GET /api/controlador`, e a razão de haver uma fonte só é evitar divergência:
são dois repositórios e dois deploys, e duas cópias do CNPJ acabam diferentes no
primeiro ajuste, com a página errada seguindo no ar dizendo algo plausível.

Ler por requisição (em vez de no build) é o que faz uma mudança no app alcançar
estas páginas sem um deploy desta landing só para isso. **Mudar o valor exige
deploy de um dos lados de qualquer forma** — variável de ambiente só passa a
valer com o serviço reiniciado, aqui e lá. O cache de borda (`s-maxage=3600`)
devolve o desempenho de página estática.

Como rede de segurança, as variáveis `PUBLIC_LEGAL_*` guardam o último valor
conhecido e entram quando o app não responde — mesmo papel do
`data/waitlist.jsonl` no formulário. Página legal sem controlador identificado
é defeituosa, e o pior desfecho possível é ela ficar assim porque um servidor
estava fora do ar.

**As duas páginas não carregam GTM nem analytics**, ao contrário da landing:
medir o clique de quem foi ler a política de privacidade seria contradizê-la.

O texto vive só aqui. O app linka para estas páginas (rodapé do aceite de
convite e a tela de Ajuda) e guarda o registro de quem aceitou qual versão —
uma segunda cópia do texto divergiria na primeira revisão.

## Arquitetura de design

- Tokens de cor e tipografia: `src/styles/global.css` (arquivo único)
- Fontes self-hosted em `public/fonts` (Besley, Atkinson Hyperlegible, Courier Prime)
- Sem bibliotecas de animação: só CSS + IntersectionObserver, com
  `prefers-reduced-motion` respeitado (inclusive pausando o vídeo em loop)

## Lockfile

A versão do npm está fixada em `packageManager` (`npm@11.19.0`): a Vercel a
respeita e, com o Corepack ligado (`corepack enable`), o seu terminal também.

O motivo é o lock: o npm 10 grava nele só os binários da plataforma em que
rodou — no macOS, o `@tailwindcss/oxide-darwin-*` e nada de Linux —, e o
`npm ci` do build recusa o lock por estar fora de sincronia com o
`package.json`. Sem o Corepack, regenere com `npx npm@11 install`.

O npm 11 pede Node `^20.17` ou `>=22.9`; em versão anterior ele avisa e roda,
mas vale atualizar o Node local.
