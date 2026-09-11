import type { APIRoute } from 'astro';
import { createHmac } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Única rota server-side do projeto — o restante da landing é HTML estático.
export const prerender = false;

const OPCOES_CONDOMINIOS = ['1', '2 a 4', '5 a 10', 'mais de 10'];

type Erros = Record<string, string>;

function validar(dados: Record<string, string>): Erros {
  const erros: Erros = {};

  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.nome = 'Digite seu nome — é como vou te chamar no WhatsApp.';
  }

  const digitos = (dados.whatsapp || '').replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 11) {
    erros.whatsapp = 'Digite o WhatsApp com DDD, no formato (21) 98765-4321.';
  }

  if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
    erros.email = 'Confira o e-mail — precisa ter o formato nome@exemplo.com.br.';
  }

  if (!OPCOES_CONDOMINIOS.includes(dados.condominios || '')) {
    erros.condominios = 'Escolha uma das quatro opções de quantidade.';
  }

  return erros;
}

type Registro = {
  nome: string;
  /** Nulo quando a pessoa não representa escritório — o campo é opcional. */
  empresa: string | null;
  whatsapp: string;
  email: string;
  condominios: string;
  utm_source: string | null;
  criado_em: string;
};

/**
 * Envia a solicitação ao app, que é onde ela vira fila de trabalho da equipe.
 *
 * O corpo é assinado com HMAC-SHA256: o segredo nunca viaja e um corpo alterado
 * no caminho invalida a assinatura.
 *
 * **Devolve o motivo, e não só `false`.** Uma migração de domínio do app deixou
 * a entrega quebrada por uma semana sem ninguém saber: o formulário responde
 * sucesso de propósito (a pessoa não pode ver erro depois de preencher tudo), o
 * arquivo de rede de segurança não existe em serverless, e o log dizia apenas
 * "app indisponível" — que não distingue URL errada de segredo trocado, os dois
 * casos mais prováveis justamente depois de mexer em ambiente. Sem o motivo, a
 * investigação começa por adivinhação.
 */
type Resultado = { entregue: true } | { entregue: false; motivo: string };

async function enviarAoApp(registro: Registro): Promise<Resultado> {
  const url = import.meta.env.APP_LEADS_URL;
  const segredo = import.meta.env.APP_LEADS_SECRET;

  if (!url || !segredo) {
    return {
      entregue: false,
      motivo: `configuração ausente (APP_LEADS_URL ${url ? 'ok' : 'faltando'}, APP_LEADS_SECRET ${segredo ? 'ok' : 'faltando'})`,
    };
  }

  const corpo = JSON.stringify({
    name: registro.nome,
    company_name: registro.empresa,
    email: registro.email,
    whatsapp: registro.whatsapp,
    condominiums_range: registro.condominios,
    utm_source: registro.utm_source,
  });

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-SindiOps-Signature': createHmac('sha256', segredo).update(corpo).digest('hex'),
      },
      body: corpo,
      // O formulário não pode ficar preso esperando o app: passou disso, o
      // arquivo local assume e a importação recupera depois.
      signal: AbortSignal.timeout(5000),
    });

    if (resposta.ok) return { entregue: true };

    // O corpo do erro é o que resolve o caso: o app responde "Assinatura
    // ausente" quando o segredo não está configurado do lado dele e
    // "Assinatura inválida" quando os dois segredos divergem. São problemas
    // diferentes, com correções diferentes, e ambos chegam como 401.
    // Numa linha só: o JSON do erro vem formatado com quebras, e log
    // multilinha em plataforma serverless se fragmenta e escapa do filtro.
    const detalhe = await resposta
      .text()
      .then((t) => t.replace(/\s+/g, ' ').trim().slice(0, 200))
      .catch(() => '');

    return {
      entregue: false,
      motivo: `app respondeu ${resposta.status} em ${url} — ${detalhe || 'sem corpo'}`,
    };
  } catch (erro) {
    // Erro de rede: DNS que não resolve (domínio antigo depois de migrar),
    // certificado, ou o timeout de 5s.
    return {
      entregue: false,
      motivo: `falha de rede ao chamar ${url} — ${erro instanceof Error ? erro.message : String(erro)}`,
    };
  }
}

export const POST: APIRoute = async ({ request }) => {
  let dados: Record<string, string> = {};

  const tipo = request.headers.get('content-type') || '';
  if (tipo.includes('application/json')) {
    dados = await request.json();
  } else {
    const form = await request.formData();
    for (const [chave, valor] of form.entries()) {
      if (typeof valor === 'string') dados[chave] = valor;
    }
  }

  // Honeypot: campo invisível que humano não preenche
  if (dados.site) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const erros = validar(dados);
  if (Object.keys(erros).length > 0) {
    return new Response(JSON.stringify({ ok: false, erros }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const registro: Registro = {
    nome: dados.nome.trim(),
    // Vazio vira nulo, e não string vazia: "não informou" e "informou nada"
    // são a mesma coisa para quem lê depois, e uma delas só suja o banco.
    empresa: dados.empresa?.trim() || null,
    whatsapp: dados.whatsapp.trim(),
    email: dados.email.trim().toLowerCase(),
    condominios: dados.condominios,
    utm_source: dados.utm_source || null,
    criado_em: new Date().toISOString(),
  };

  const resultado = await enviarAoApp(registro);

  // O arquivo deixou de ser o destino e virou rede de segurança: só guarda o
  // que o app não recebeu. `php artisan leads:import` recupera essas linhas.
  //
  // Em serverless o disco é somente leitura (e efêmero), então a gravação
  // falha e o registro vai para o log da plataforma. Sem o try/catch, o EROFS
  // subiria como 500 e a pessoa veria erro depois de já ter preenchido tudo —
  // perderíamos o lead E a confiança dela.
  if (!resultado.entregue) {
    // O motivo vem antes do registro na mesma linha: quem lê o log da
    // plataforma precisa saber **por que** falhou antes de decidir se recupera
    // a lista ou corrige a configuração.
    console.error(`[waitlist] não entregue ao app: ${resultado.motivo}`);

    try {
      const dir = path.resolve('./data');
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, 'waitlist.jsonl'), JSON.stringify(registro) + '\n', 'utf8');
    } catch {
      console.error('[waitlist] lead perdido (disco somente leitura):', JSON.stringify(registro));
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
