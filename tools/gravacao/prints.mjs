import { chromium } from 'playwright';
import fs from 'node:fs';

/**
 * Prints das telas que sustentam o argumento, em 2x.
 *
 * Só a viewport, sem cromo de navegador: barra de endereço e abas roubam pixel
 * e datam o material. Quem for compor no Flow põe a moldura que quiser.
 */
const BASE = 'http://localhost:8020';
const SAIDA = './prints';
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'pt-BR',
  colorScheme: 'light',
});
await ctx.addCookies([{ name: 'appearance', value: 'light', domain: 'localhost', path: '/' }]);

const login = await ctx.newPage();
await login.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await login.fill('#email', 'demo@sindiops.test');
await login.fill('#password', 'demonstracao');
await login.click('button[type=submit]');
await login.waitForTimeout(2500);
await login.close();

const page = await ctx.newPage();
const { CONDO, ORC, QUOTE } = process.env;

async function print(nome, url, preparar) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  if (preparar) await preparar();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${SAIDA}/${nome}.png` });
  console.log('✓', nome);
}

await print('01-painel-condominio', `${BASE}/condominios/${CONDO}`);

// A consulta precisa existir antes do print. Num tenant recém-criado não há
// nenhuma, e a tela sairia com "Nenhuma consulta ainda" — que é o estado
// vazio, não a prova.
await page.goto(`${BASE}/condominios/${CONDO}/consulta`, { waitUntil: 'networkidle' });
if (await page.locator('text=/Nenhuma consulta ainda/').count()) {
  await page.fill('#question', 'O morador pode fazer obra com furadeira no sábado de manhã?');
  await page.click('button:has-text("Perguntar")');
  await page.waitForSelector('button:has-text("Art.")', { timeout: 180000 });
  await page.waitForTimeout(1200);
}

await print('02-consulta-resposta', `${BASE}/condominios/${CONDO}/consulta`, async () => {
  await page.mouse.wheel(0, 180);
});

await print('03-citacao-aberta', `${BASE}/condominios/${CONDO}/consulta`, async () => {
  const c = page.locator('button:has-text("Art. 52")').first();
  await c.scrollIntoViewIfNeeded();
  await c.click();
  await page.waitForSelector('[role=dialog]');
});

await print('04-processo-criterios', `${BASE}/orcamentos/${ORC}`, async () => {
  await page.mouse.wheel(0, 380);
});

await print('05-proposta-lida', `${BASE}/propostas/${QUOTE}`);

await print('06-conferencia-trecho', `${BASE}/propostas/${QUOTE}`, async () => {
  await page.click('button:has-text("Conferir")');
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 420);
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Ver trecho da proposta")').nth(1).click();
});

await print('07-fornecedores', `${BASE}/fornecedores`);
await print('08-condominios', `${BASE}/condominios`);

await browser.close();
console.log('prints em', SAIDA);
