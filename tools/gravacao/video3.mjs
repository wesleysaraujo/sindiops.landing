import fs from 'node:fs';
import {
    abrirEstudio,
    clicar,
    digitar,
    instalarCursor,
    irAte,
    palcoAutenticado,
    rolar,
} from './estudio.mjs';

/**
 * Vídeo 3 — o contrato: o prazo que avisa e o reajuste que se confere.
 *
 * O gesto decisivo aqui é o mesmo dos outros dois, com outra fonte: a citação
 * do vídeo 1 aponta o artigo da convenção, o trecho do vídeo 2 aponta a linha
 * da proposta, e a conta deste aponta a **cláusula do reajuste** — e, ao lado
 * dela, uma diferença em dinheiro que o síndico leva ao fornecedor.
 *
 * A ordem é a da vida real, não a do menu: primeiro o prazo que ele não viu
 * passar (com a cláusula que o define), depois a fatura que subiu. Começar pela
 * conta seria mostrar o troco antes de dizer de onde veio a compra.
 */

const BASE = 'http://localhost:8020';
const SAIDA = './saida/video3';

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const { browser, context } = await abrirEstudio(SAIDA);

const page = await palcoAutenticado(context, {
    email: 'demo@sindiops.test',
    senha: 'demonstracao',
    base: BASE,
    url: `${BASE}/contratos/${process.env.CONTRATO}`,
});

await instalarCursor(page);
await page.waitForTimeout(1000);

// ---- 1. O prazo, com a cláusula que o sustenta ----
// A coluna da direita abre no card de prazos. Duas paradas: a primeira mostra
// "faltam N dias", a segunda a cláusula grifada logo abaixo — é ela que
// diferencia isto de um lembrete de calendário.
await irAte(page, 'div[data-slot="card"]:has([data-slot="card-title"]:text-is("Prazos do contrato"))');
await page.waitForTimeout(2600);

await rolar(page, 260);
await page.waitForTimeout(2400);

// ---- 2. A conferência do reajuste ----
await irAte(page, 'div[data-slot="card"]:has([data-slot="card-title"]:text-is("Conferência de reajuste"))');
await page.waitForTimeout(1400);

// O mês vem preenchido pela ficha conferida; o que o síndico digita é o que o
// fornecedor cobrou. Digitar só esse campo é o recorte honesto do trabalho que
// a tela pede dele.
// Sem vírgula: o campo é `type=number` e o navegador descarta o separador —
// "1940,00" entrou como 194000 e a cena saiu com uma cobrança de R$ 194 mil.
await digitar(page, '#ajuste-valor', '2190');
await page.waitForTimeout(600);

await clicar(page, 'button:has-text("Conferir")');

// A conta passa pela série do Banco Central: a espera é real e fica no take.
// O corte decide o que fazer com ela — esconder aqui seria gravar um produto
// que não existe.
await page.waitForSelector('text=/Cobrança acima|Confere/', { timeout: 30000 });
await page.waitForTimeout(3200);

// ---- 3. A conta aberta: o que faz a diferença ser defensável ----
await clicar(page, 'button:has-text("Ver a conta mês a mês")');
await page.waitForTimeout(4200); // segurar: é a cena decisiva

await context.close();
await browser.close();
console.log('take 3 pronto');
