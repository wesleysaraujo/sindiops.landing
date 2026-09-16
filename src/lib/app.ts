/**
 * Onde vive a aplicação, num lugar só.
 *
 * O endereço já estava escrito à mão nos termos de uso — e **errado**:
 * `app.sindiops.com.br`, que não existe. Quem tem conta chegava ao sistema
 * decorando a URL ou caçando um e-mail antigo, porque a landing inteira
 * apontava para o formulário de acesso antecipado e nunca para a porta de
 * entrada de quem já entrou uma vez.
 *
 * Mesma razão do `contato.ts`: endereço repetido é a coisa que mais diverge
 * quando muda. Sobra o antigo na página menos visitada, e quem clica nele
 * conclui que o sistema saiu do ar.
 */
export const APP_HOST = 'app.sindiops.ia.br';

export const APP_URL = `https://${APP_HOST}`;

/**
 * O rótulo do link. "Entrar" e não "Login": é a palavra que o resto da página
 * usa em português, e quem tem conta reconhece as duas — quem não tem não
 * clica em nenhuma.
 */
export const APP_LABEL = 'Entrar';
