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
 * no caminho invalida a assinatura. Devolve `false` em qualquer falha — quem
 * chama grava no arquivo local como rede de segurança.
 */
async function enviarAoApp(registro: Registro): Promise<boolean> {
  const url = import.meta.env.APP_LEADS_URL;
  const segredo = import.meta.env.APP_LEADS_SECRET;

  if (!url || !segredo) return false;

  const corpo = JSON.stringify({
    name: registro.nome,
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

    return resposta.ok;
  } catch {
    return false;
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
    whatsapp: dados.whatsapp.trim(),
    email: dados.email.trim().toLowerCase(),
    condominios: dados.condominios,
    utm_source: dados.utm_source || null,
    criado_em: new Date().toISOString(),
  };

  const entregue = await enviarAoApp(registro);

  // O arquivo deixou de ser o destino e virou rede de segurança: só guarda o
  // que o app não recebeu. `php artisan leads:import` recupera essas linhas.
  //
  // Em serverless o disco é somente leitura (e efêmero), então a gravação
  // falha e o registro vai para o log da plataforma. Sem o try/catch, o EROFS
  // subiria como 500 e a pessoa veria erro depois de já ter preenchido tudo —
  // perderíamos o lead E a confiança dela.
  if (!entregue) {
    try {
      const dir = path.resolve('./data');
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, 'waitlist.jsonl'), JSON.stringify(registro) + '\n', 'utf8');
    } catch {
      console.error('[waitlist] app indisponível e disco somente leitura:', JSON.stringify(registro));
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
