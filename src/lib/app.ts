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
 * O rótulo, em duas larguras.
 *
 * **"Já tenho conta" auto-seleciona quem clica**, e é isso que permite o botão
 * ser visível sem competir com a oferta: um visitante novo lê o rótulo e sabe
 * que não é para ele, então continua descendo para o formulário. "Entrar"
 * sozinho não diz a quem serve, e ainda deixa a pergunta "entrar onde?".
 *
 * A forma curta existe para o celular, onde o cabeçalho tem a largura da marca
 * mais dois dedos. A troca é por CSS (`hidden`/`sm:inline`) e não por
 * JavaScript: o rótulo certo precisa estar no HTML da primeira pintura.
 */
export const APP_LABEL = 'Já tenho conta';

export const APP_LABEL_CURTO = 'Entrar';

/**
 * O visual do botão, num lugar só — ele se repete em cinco cascas.
 *
 * **Contornado, nunca preenchido.** A página tem uma única pergunta ("quero
 * acesso antecipado"), e um segundo botão de fundo cheio a transformaria em
 * duas. A borda basta para o olho reconhecer um controle clicável em vez de
 * uma nota de rodapé — que foi o erro da primeira versão: um link de texto do
 * mesmo peso de "Todos os guias", num canto onde a pessoa procura um botão.
 */
export const APP_BOTAO =
  'inline-flex shrink-0 items-center rounded-md border-2 border-caneta bg-papel px-4 py-2 text-[0.95rem] font-bold text-caneta transition-colors hover:bg-caneta hover:text-white';
