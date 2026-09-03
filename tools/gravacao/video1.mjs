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

/**
 * Marcos para o corte, em segundos desde a criacao da pagina — que e quando o
 * Playwright comeca a gravar. O `gravar.sh` reancora tudo pela duracao real do
 * arquivo, entao um offset constante nao atrapalha.
 *
 * Existem porque ponto de corte fixo nao sobrevive a esta cena: a espera da
 * consulta e uma chamada a modelo e varia de 2 a 40 segundos. Numa regravacao
 * com tempos fixos o poster caiu na tela de "Consultando os documentos
 * vigentes" em vez da gaveta com o artigo — e o poster e justamente o que fica
 * parado na tela de quem nao ve o video rodar.
 */
const t0 = Date.now();
const marcos = {};
const marcar = (nome) => { marcos[nome] = (Date.now() - t0) / 1000; };
marcar('inicio');

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
marcar('gaveta');
await page.waitForTimeout(4400);          // segurar: e a cena decisiva
marcar('fim');

await context.close();
await browser.close();

fs.writeFileSync(`${SAIDA}/marcos.json`, JSON.stringify(marcos, null, 2));
console.log('take pronto', JSON.stringify(marcos));
