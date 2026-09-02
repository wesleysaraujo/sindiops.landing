import { abrirEstudio, instalarCursor, palcoAutenticado, clicar, irAte, rolar, mover } from './estudio.mjs';
import fs from 'node:fs';

const BASE = 'http://localhost:8020';
const SAIDA = './saida/video2';
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const { browser, context } = await abrirEstudio(SAIDA);

// Começa no painel do processo: é ali que os pesos estão à vista, e é isso que
// precisa ficar estabelecido antes de qualquer proposta aparecer — a tese é que
// os critérios vieram primeiro.
const page = await palcoAutenticado(context, {
  email: 'demo@sindiops.test',
  senha: 'demonstracao',
  base: BASE,
  url: `${BASE}/orcamentos/${process.env.ORC}`,
});

await instalarCursor(page);
await page.waitForTimeout(1000);

// ---- Os pesos, antes das propostas ----
await rolar(page, 320);
await page.waitForTimeout(2400);
await rolar(page, 300);
await page.waitForTimeout(2000);

// ---- A proposta ----
await page.goto(`${BASE}/propostas/${process.env.QUOTE}`, { waitUntil: 'networkidle' });
await instalarCursor(page);
await page.waitForTimeout(1600);

// ---- A grade de conferência ----
await clicar(page, 'button:has-text("Conferir")');
await page.waitForTimeout(1800);

// ---- O trecho que comprova: o gesto gêmeo da citação do vídeo 1 ----
await rolar(page, 420);
await page.waitForTimeout(900);

const verTrecho = page.locator('button:has-text("Ver trecho da proposta")').nth(1);
await verTrecho.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const caixa = await verTrecho.boundingBox();
await mover(page, caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
await page.waitForTimeout(240);
await page.evaluate(() => window.__piscarCursor?.());
await verTrecho.click();
await page.waitForTimeout(4200);          // segurar: é a cena decisiva

await context.close();
await browser.close();
console.log('take 2 pronto');
