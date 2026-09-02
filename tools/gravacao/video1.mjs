import { abrirEstudio, instalarCursor, palcoAutenticado, clicar, digitar, rolar, mover } from './estudio.mjs';
import fs from 'node:fs';

const BASE = 'http://localhost:8080'.replace('8080', '8020');
const SAIDA = './saida/video1';
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const { browser, context } = await abrirEstudio(SAIDA);

// A página gravada nasce já na tela da cena: o login acontece em outra, que é
// fechada antes. Ver `palcoAutenticado`.
const page = await palcoAutenticado(context, {
  email: 'demo@sindiops.test',
  senha: 'demonstracao',
  base: BASE,
  url: `${BASE}/condominios/${process.env.CONDO}/consulta`,
});

await instalarCursor(page);
await page.waitForTimeout(900);

// ---- A pergunta ----
await digitar(page, '#question', 'O morador pode fazer obra com furadeira no sábado de manhã?');
await page.waitForTimeout(420);

// ---- A espera, que é real e fica ----
await clicar(page, 'button:has-text("Perguntar")');

// ---- A resposta ----
await page.waitForSelector('button:has-text("Art.")', { timeout: 120000 });
await page.waitForTimeout(1600);
await rolar(page, 200);
await page.waitForTimeout(1800);

// ---- A citação: a cena que vende o produto ----
const citacao = page.locator('button:has-text("Art. 52")').first();
await citacao.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const caixa = await citacao.boundingBox();
await mover(page, caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
await page.waitForTimeout(260);
await page.evaluate(() => window.__piscarCursor?.());
await page.waitForTimeout(140);
await citacao.click();
await page.waitForSelector('[role=dialog]', { timeout: 15000 });
await page.waitForTimeout(4400);          // segurar: é a cena decisiva

await context.close();
await browser.close();
console.log('take pronto');
