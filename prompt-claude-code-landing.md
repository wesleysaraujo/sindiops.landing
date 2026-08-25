# Prompt para o Claude Code — Landing Page

> Cole o conteúdo abaixo (tudo a partir de "## Contexto") no Claude Code, com o `landing-copy.md` anexado ou no repositório.

---

## Contexto

Você é o design lead de um estúdio pequeno conhecido por dar a cada cliente uma identidade visual que não poderia ser confundida com a de nenhum outro. Este cliente já rejeitou propostas que pareciam template e está pagando por um ponto de vista.

O produto: uma ferramenta para síndicos de condomínio no Brasil. O síndico sobe a convenção, o regimento interno e as atas do prédio; pergunta em português ("posso multar por obra no sábado?") e recebe a resposta **com o artigo, o parágrafo e a página citados**, sempre da versão vigente do documento. A partir da resposta, gera notificações e circulares fundamentadas.

**A tarefa desta página é uma só:** fazer o síndico entender em 5 segundos que a resposta vem citada, e deixar o WhatsApp na lista de acesso antecipado.

## Público — leia com atenção, isso define o design

Não é fundador de startup em São Paulo. É **síndico profissional de 40 a 60 anos, no Rio de Janeiro, lendo no celular Android, provavelmente entre um compromisso e outro**. Administra de 5 a 20 prédios. É cético com tecnologia porque já comprou sistema que não usou.

Consequências diretas:

- Corpo de texto grande. Nada abaixo de 17px no mobile.
- Contraste alto de verdade. Cinza claro sobre branco é inacessível para essa faixa etária.
- Zero jargão de startup. Nada de "plataforma all-in-one", "revolucionar", "IA de ponta".
- Português do Brasil em 100% da interface, incluindo labels de formulário e mensagens de erro.
- Mobile-first não como slogan: projete o mobile primeiro e adapte para desktop depois.

## Conteúdo

Todo o copy está em `landing-copy.md`. Use-o como fonte — pode ajustar quebras e microcopy para servir ao layout, mas não invente seções novas nem substitua as headlines por texto genérico. Se cortar algo, diga o que cortou e por quê.

## O que NÃO fazer

Este é o padrão da concorrência (sindigestor.com.br) e é exatamente o que queremos evitar:

- Gradiente roxo/azul no herói, glassmorphism, blobs desfocados
- Grade de cards idênticos, cada um com ícone Lucide dentro de um círculo pastel
- Mockup genérico de dashboard flutuando em perspectiva
- Contadores de vaidade ("+500 clientes", "-80% de tempo") e depoimentos com avatar de iniciais coloridas
- Emoji em título de seção, badge "Premium", "Chega de caos no seu condomínio"
- Seção de preço (não existe preço definido — não invente)

Também evite os três clichês atuais de página gerada por IA, porque aparecem independentemente do assunto e entregam a origem:

1. Fundo creme (~#F4F1EA) + serifada de alto contraste + acento terracota (~#D97757)
2. Fundo quase preto + um único acento verde-ácido ou vermelhão
3. Layout de jornal com fios capilares, border-radius zero e colunas densas

O terceiro é especialmente tentador aqui, porque o assunto é documento jurídico. Resista à versão óbvia dele.

## Onde buscar a direção

No mundo do próprio assunto: documento normativo, numeração de artigo, referência cruzada, margem de página, carimbo, verificação. O produto trata de **procedência** — toda afirmação aponta para sua fonte. A página deveria fazer o visitante sentir isso antes de ler sobre isso.

Um elemento de assinatura é obrigatório: uma coisa que a página faça e que ninguém mais faça, derivada dessa ideia. Gaste sua ousadia só nele e mantenha todo o resto quieto e disciplinado.

## Processo (siga nesta ordem)

**1. Plano de design, antes de qualquer código.** Escreva:

- **Paleta:** 4 a 6 valores hex nomeados, com a razão de cada um
- **Tipografia:** duas ou três famílias com papéis distintos (display com personalidade usado com parcimônia, corpo legível, e uma utilitária para referências tipo `Art. 42, §2º`). Não use as famílias que você usaria em qualquer outro projeto.
- **Layout:** conceito em uma frase + wireframe em ASCII do mobile e do desktop
- **Assinatura:** o único elemento pelo qual esta página será lembrada

**2. Critique o próprio plano.** Pergunte-se: se eu recebesse um brief parecido para outro produto, chegaria neste mesmo lugar? Onde a resposta for sim, refaça e explique o que mudou.

**3. Só então implemente**, seguindo o plano revisado à risca.

**4. Critique de novo depois de pronto.** Tire screenshot no mobile e no desktop se o ambiente permitir. Aplique a regra da Chanel: antes de entregar, tire um acessório.

## Restrições técnicas

- Vue 3 + Inertia dentro do app Laravel existente, como página pública na rota `/`
- Tailwind. shadcn-vue só onde couber (formulário) — não force componente onde CSS resolve
- Tokens de cor e tipo como CSS custom properties em um único arquivo
- Fontes self-hosted com `font-display: swap`. Nenhuma requisição ao Google Fonts
- Sem biblioteca de animação. Se houver movimento, CSS e IntersectionObserver
- `prefers-reduced-motion` respeitado. Foco de teclado visível. Contraste mínimo AA
- Bloco de vídeo no herói: `<video>` com autoplay, muted, loop, playsinline, `poster` e fallback de imagem — o arquivo ainda não existe, deixe o placeholder claro
- Formulário: nome, WhatsApp (com máscara), e-mail, e "quantos condomínios você administra" (1 / 2 a 4 / 5 a 10 / mais de 10). POST para `/waitlist`, com captura de `utm_source` da query string em campo oculto. Validação e mensagens de erro em português, dizendo o que fazer e não só o que falhou
- Sem menu de navegação, sem rodapé inchado, sem cookie banner

## Entregáveis

1. O plano de design e a autocrítica (passos 1 e 2), em texto, antes do código
2. A página implementada
3. Uma lista curta do que você cortou do copy e por quê
