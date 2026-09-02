import { chromium } from 'playwright';

/**
 * Motor de gravação dos vídeos da landing.
 *
 * O Playwright grava a viewport em webm nativamente. O que ele NÃO faz é
 * desenhar o cursor: o vídeo sairia com campos se preenchendo e telas mudando
 * sozinhas, sem nada dizendo onde olhar. Como não há narração, o cursor é o
 * único narrador — daí o ponteiro sintético abaixo.
 */

export const VIEWPORT = { width: 1280, height: 800 };

const CURSOR_CSS = `
  #cursor-demo {
    position: fixed; z-index: 2147483647; top: 0; left: 0;
    width: 22px; height: 22px; pointer-events: none;
    margin: -3px 0 0 -3px;
    transition: transform 40ms linear;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.45));
  }
  /* O halo do clique: sem ele, um clique não aparece no vídeo — a tela muda e
     o espectador não sabe o que a provocou. */
  #cursor-demo-halo {
    position: fixed; z-index: 2147483646; pointer-events: none;
    width: 34px; height: 34px; margin: -17px 0 0 -17px;
    border-radius: 50%; border: 2px solid rgba(29,78,216,.9);
    opacity: 0; transform: scale(.4);
  }
  @keyframes cursor-demo-clique {
    0% { opacity: .9; transform: scale(.35); }
    100% { opacity: 0; transform: scale(1.3); }
  }
`;

const CURSOR_SVG = `
  <svg id="cursor-demo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 2l14 10-6.2.9 3.4 7-2.8 1.3-3.4-7-4 4.4z"
          fill="#111827" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>
`;

export async function instalarCursor(page) {
  await page.addStyleTag({ content: CURSOR_CSS });
  await page.evaluate(({ svg }) => {
    if (document.getElementById('cursor-demo')) return;
    const halo = document.createElement('div');
    halo.id = 'cursor-demo-halo';
    document.body.appendChild(halo);
    document.body.insertAdjacentHTML('beforeend', svg);
    window.__cursor = { x: 640, y: 400 };
    const mover = (x, y) => {
      const c = document.getElementById('cursor-demo');
      const h = document.getElementById('cursor-demo-halo');
      if (c) c.style.transform = `translate(${x}px, ${y}px)`;
      if (h) { h.style.left = x + 'px'; h.style.top = y + 'px'; }
      window.__cursor = { x, y };
    };
    window.__moverCursor = mover;
    window.__piscarCursor = () => {
      const h = document.getElementById('cursor-demo-halo');
      if (!h) return;
      h.style.animation = 'none';
      void h.offsetWidth;
      h.style.animation = 'cursor-demo-clique 420ms ease-out';
    };
    mover(640, 400);
  }, { svg: CURSOR_SVG });
}

/** Movimento com aceleração: cursor que anda em velocidade constante parece robô. */
export async function mover(page, x, y, { passos = 26 } = {}) {
  const atual = await page.evaluate(() => window.__cursor ?? { x: 640, y: 400 });

  for (let i = 1; i <= passos; i++) {
    const t = i / passos;
    // easeInOutCubic — sai devagar, acelera, chega devagar.
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const px = atual.x + (x - atual.x) * e;
    const py = atual.y + (y - atual.y) * e;
    await page.evaluate(([a, b]) => window.__moverCursor?.(a, b), [px, py]);
    await page.mouse.move(px, py);
    await page.waitForTimeout(12);
  }
}

export async function irAte(page, seletor, { posicao = 'centro' } = {}) {
  const alvo = page.locator(seletor).first();
  await alvo.waitFor({ state: 'visible', timeout: 20000 });
  await alvo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(220);

  const caixa = await alvo.boundingBox();
  if (!caixa) throw new Error(`Sem boundingBox: ${seletor}`);

  const x = caixa.x + caixa.width / 2;
  const y = posicao === 'inicio' ? caixa.y + 18 : caixa.y + caixa.height / 2;
  await mover(page, x, y);

  return alvo;
}

export async function clicar(page, seletor, opcoes = {}) {
  const alvo = await irAte(page, seletor, opcoes);
  await page.waitForTimeout(160);
  await page.evaluate(() => window.__piscarCursor?.());
  await page.waitForTimeout(120);
  await alvo.click();

  return alvo;
}

/** Digitação com ritmo irregular — cadência uniforme denuncia a máquina. */
export async function digitar(page, seletor, texto, { base = 42 } = {}) {
  const alvo = await irAte(page, seletor);
  await page.evaluate(() => window.__piscarCursor?.());
  await alvo.click();
  await page.waitForTimeout(260);

  for (const char of texto) {
    await page.keyboard.type(char);
    const pausa = char === ' ' ? base * 1.8 : base + Math.random() * 46;
    await page.waitForTimeout(pausa);
  }
}

export async function rolar(page, pixels, { passos = 30 } = {}) {
  for (let i = 0; i < passos; i++) {
    await page.mouse.wheel(0, pixels / passos);
    await page.waitForTimeout(16);
  }
}

export async function abrirEstudio(pastaVideo) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    colorScheme: 'light',
    recordVideo: { dir: pastaVideo, size: VIEWPORT },
    // O produto guarda o tema em cookie; sem isto o Blade poderia servir o
    // escuro e o vídeo brigaria com o papel creme da landing.
    extraHTTPHeaders: {},
  });

  await context.addCookies([
    { name: 'appearance', value: 'light', domain: 'localhost', path: '/' },
  ]);

  return { browser, context };
}

/**
 * Autentica numa página descartável e devolve a página que vai ser gravada.
 *
 * O Playwright grava um arquivo por página. Fazer login na mesma página que
 * grava a cena põe a tela de acesso e o painel no começo do filme, e o corte
 * por timestamp não recupera isso de forma confiável: o webm tem frame rate
 * variável e o relógio do script não mapeia linearmente para o do vídeo —
 * apanhei disso antes de chegar aqui. Com a sessão já no contexto, a página
 * gravada nasce direto na tela que interessa.
 */
export async function palcoAutenticado(context, { email, senha, base, url }) {
  const bastidor = await context.newPage();
  await entrar(bastidor, { email, senha, base });
  await bastidor.close();

  const palco = await context.newPage();
  await palco.goto(url, { waitUntil: 'networkidle' });

  return palco;
}

export async function entrar(page, { email, senha, base }) {
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', email);
  await page.fill('#password', senha);
  await page.click('button[type=submit]');
  await page.waitForURL('**/painel**', { timeout: 20000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
}
