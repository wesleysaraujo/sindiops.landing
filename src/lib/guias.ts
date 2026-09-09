import { getCollection, type CollectionEntry } from 'astro:content';

export type Guia = CollectionEntry<'guias'>;

/**
 * O que pode ir ao ar.
 *
 * Duas travas, e nenhuma é opcional: rascunho não é conteúdo, e guia que toca
 * multa, advertência ou assembleia sem revisão jurídica é pior que a ausência
 * da página. Ficam **as duas num lugar só** porque a listagem, a rota do guia e
 * o sitemap precisam concordar sobre o que existe — cada um filtrando por
 * conta própria, um deles publicaria o que os outros escondem.
 */
export async function guiasPublicados(): Promise<Guia[]> {
  const guias = await getCollection('guias', ({ data }) => !data.rascunho);

  return guias.filter(({ data }) => data.revisadoPorAdvogado || !exigeAdvogado(data.frente));
}

/**
 * Convenção é o terreno da multa, da advertência e do quórum de assembleia:
 * afirmação errada ali chega ao morador como decisão do síndico. Contrato e
 * orçamento são conta e procedimento — erro se corrige sem custar o mandato de
 * ninguém.
 */
function exigeAdvogado(frente: Guia['data']['frente']): boolean {
  return frente === 'convencao';
}

export const FRENTES = [
  {
    id: 'convencao' as const,
    titulo: 'Convenção e regimento',
    descricao: 'O que o condomínio pode exigir, proibir e punir — e onde isso está escrito.',
  },
  {
    id: 'contrato' as const,
    titulo: 'Contratos do prédio',
    descricao: 'Prazo, renovação automática, aviso prévio e reajuste dos contratos que você herdou.',
  },
  {
    id: 'orcamento' as const,
    titulo: 'Orçamento e contratação',
    descricao: 'Como pedir proposta, comparar sem escolher pelo preço e registrar a decisão.',
  },
];

/**
 * Agrupa por frente, na ordem declarada em `FRENTES`, e devolve só o que tem
 * conteúdo: seção vazia no índice anuncia o que falta em vez do que existe.
 */
export function agrupadosPorFrente(guias: Guia[]) {
  return FRENTES.map((frente) => ({
    ...frente,
    guias: guias
      .filter((guia) => guia.data.frente === frente.id)
      .sort((a, b) => a.data.ordem - b.data.ordem),
  })).filter((grupo) => grupo.guias.length > 0);
}

/** "9 de setembro de 2026" — a data por extenso, como no resto do site. */
export function dataPorExtenso(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}
