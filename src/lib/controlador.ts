/**
 * Identificação de quem responde pelo tratamento dos dados (LGPD, art. 41).
 *
 * A fonte de verdade é o app, não esta landing, e a razão é operacional: na
 * Vercel, variável de ambiente só passa a valer com um novo deploy, enquanto no
 * servidor do app basta editar o `.env` e recarregar o cache de configuração.
 * Trocar de endereço ou de encarregado não deveria depender de build.
 *
 * O último valor conhecido fica no ambiente da landing como **rede de
 * segurança**, no mesmo espírito do `waitlist.jsonl`: uma página legal não pode
 * deixar de identificar o controlador porque o app estava fora do ar no momento
 * do acesso. Quando nem isso existe, o campo sai como indisponível e com o
 * canal de contato — dado ausente é defeito, dado errado é pior.
 */
export type Controlador = {
  legal_name: string | null;
  cnpj: string | null;
  address: string | null;
  dpo_name: string | null;
  dpo_email: string | null;
};

/**
 * Texto ausente vira nulo, e string vazia conta como ausente.
 *
 * A distinção não é preciosismo: quem consome escreve `valor ?? 'não informado'`
 * — a forma natural —, e `''` atravessa esse operador sem disparar. O defeito
 * que isso produz é a página imprimindo "operado por ." em vez de admitir que
 * falta o dado. Vale tanto para a variável de ambiente declarada e vazia quanto
 * para o que chega da resposta do app, que é dado de fora e não se supõe limpo.
 */
function naoVazio(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : null;
}

/** Último valor conhecido, embutido no build. */
function doAmbiente(): Controlador {
  return {
    legal_name: naoVazio(import.meta.env.PUBLIC_LEGAL_NAME),
    cnpj: naoVazio(import.meta.env.PUBLIC_LEGAL_CNPJ),
    address: naoVazio(import.meta.env.PUBLIC_LEGAL_ADDRESS),
    dpo_name: naoVazio(import.meta.env.PUBLIC_LEGAL_DPO_NAME),
    dpo_email: naoVazio(import.meta.env.PUBLIC_LEGAL_DPO_EMAIL) ?? 'privacidade@sindiops.com.br',
  };
}

export async function obterControlador(): Promise<Controlador> {
  const base = import.meta.env.APP_LEADS_URL;

  if (!base) {
    return doAmbiente();
  }

  // A mesma origem do endpoint de leads, trocando o caminho: as duas rotas
  // vivem no mesmo app, e derivar daqui evita uma segunda variável que possa
  // apontar para outro lugar sem ninguém perceber.
  const url = base.replace(/\/leads\/?$/, '/controlador');

  try {
    // Timeout curto: as páginas legais são renderizadas por requisição (é o
    // que permite trocar o dado no app sem redeploy da landing), então app
    // lento viraria página lenta. O valor de reserva já está em mãos.
    const resposta = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!resposta.ok) {
      return doAmbiente();
    }

    const corpo = (await resposta.json()) as { controller?: Record<string, unknown> };
    const vindo = corpo.controller ?? {};
    const reserva = doAmbiente();

    // Campo a campo, e não o objeto inteiro: uma resposta com o endereço ainda
    // em branco não deve apagar o endereço que a landing já conhecia.
    return {
      legal_name: naoVazio(vindo.legal_name) ?? reserva.legal_name,
      cnpj: naoVazio(vindo.cnpj) ?? reserva.cnpj,
      address: naoVazio(vindo.address) ?? reserva.address,
      dpo_name: naoVazio(vindo.dpo_name) ?? reserva.dpo_name,
      dpo_email: naoVazio(vindo.dpo_email) ?? reserva.dpo_email,
    };
  } catch {
    return doAmbiente();
  }
}
