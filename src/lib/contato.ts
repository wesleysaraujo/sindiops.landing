/**
 * Os canais de contato do SindiOps, num lugar só.
 *
 * O e-mail estava escrito à mão em quatro rodapés — home, termos, privacidade e
 * guias — e o WhatsApp não existia em nenhum. Número de contato repetido é a
 * coisa que mais diverge quando muda: sobra o antigo na página menos visitada,
 * e quem escreve para ele conclui que ninguém responde.
 */
export const EMAIL = 'contato@sindiops.com.br';

/** Como o número aparece para quem lê. */
export const WHATSAPP = '(21) 97107-6671';

/**
 * `wa.me` exige só dígitos, **com o código do país**: sem o 55 o link abre uma
 * conversa vazia com um número que não existe, e o erro não aparece aqui — ele
 * aparece no celular de quem tentou falar com a gente.
 */
export const WHATSAPP_URL = 'https://wa.me/5521971076671';

/** O que o link de e-mail precisa: o endereço, com o esquema. */
export const EMAIL_URL = `mailto:${EMAIL}`;
