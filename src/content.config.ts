import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

/**
 * Os guias do síndico.
 *
 * **São guias, não um blog**, e a diferença está no que cada palavra promete.
 * Blog promete cadência: quem vê "última publicação há oito meses" conclui que
 * o produto foi abandonado, num site cujo trabalho é convencer um cético a
 * confiar. Um texto sobre quórum de destituição vale igual hoje ou daqui a um
 * ano — por isso o índice é temático, e não cronológico, e por isso a data
 * aparece como "revisado em", no rodapé, e não como manchete.
 *
 * Markdown no repositório, e não um CMS: o texto passa por revisão antes de
 * existir no ar, que é exatamente o que estes assuntos exigem. Guia sobre multa
 * publicado direto de uma caixa de texto às onze da noite é o contra-exemplo do
 * que o produto vende.
 */
const guias = defineCollection({
  loader: glob({ base: './src/content/guias', pattern: '**/*.md' }),
  schema: z.object({
    /**
     * O título é a pergunta **na forma em que a pessoa a digita**. "Multa por
     * barulho: procedimento" é como um advogado indexaria; "Posso multar
     * morador por barulho?" é como o síndico pergunta, e é essa a frase que
     * precisa bater com a busca.
     */
    titulo: z.string().min(15).max(90),

    /**
     * Some no `<meta name="description">` e no cartão de link. Obrigatória e
     * com tamanho travado: descrição esquecida é o defeito mais comum de
     * conteúdo publicado, e aqui o build recusa em vez de deixar passar.
     */
    resumo: z.string().min(70).max(200),

    /**
     * A resposta curta, em uma ou duas frases, antes de qualquer explicação.
     * Fica no topo do guia e é o trecho que um buscador (ou um assistente que
     * responde citando fontes) consegue recortar. Quem chegou pela busca quer
     * a resposta, não o percurso até ela.
     */
    respostaCurta: z.string().min(80).max(400),

    frente: z.enum(['convencao', 'orcamento', 'contrato']),

    publicadoEm: z.coerce.date(),
    revisadoEm: z.coerce.date().optional(),

    /**
     * Guia que trata de multa, advertência ou assembleia só vai ao ar depois
     * de revisão jurídica — a tese do produto é a procedência, e uma página
     * nossa citando artigo errado seria o contra-exemplo perfeito. Enquanto
     * `false`, o build não publica.
     */
    revisadoPorAdvogado: z.boolean().default(false),

    /**
     * Rascunho não entra no site nem no sitemap. Serve para escrever com calma
     * dentro do repositório, sem uma pasta paralela que ninguém revisa.
     */
    rascunho: z.boolean().default(false),

    /** Ordem dentro da frente, no índice. Menor primeiro. */
    ordem: z.number().int().default(99),
  }),
});

export const collections = { guias };
