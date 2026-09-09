---
titulo: 'Como conferir se o reajuste do contrato do condomínio está certo'
resumo: 'O fornecedor mandou o novo valor dizendo que é o índice. Veja como refazer a conta mês a mês, com a série oficial, e descobrir se a diferença é sua ou dele.'
respostaCurta: 'Pegue o valor original, o índice escrito na cláusula e o período de 12 meses. Componha as variações mês a mês (multiplicando, nunca somando) e compare com o que foi cobrado. Se a diferença aparecer já no primeiro mês, ela se repete por doze — e volta no ano seguinte, porque o próximo reajuste parte do valor errado.'
frente: contrato
publicadoEm: 2026-09-09
ordem: 1
---

Todo mês de aniversário do contrato chega o e-mail: o valor sobe, e a
justificativa é uma frase — "conforme índice previsto em contrato". Quase
ninguém confere, e o motivo é razoável: conferir exige abrir o contrato, achar a
cláusula, procurar a série do índice e fazer uma conta que ninguém lembra como
faz.

Este guia é essa conta.

## O que você precisa em mãos

Três coisas, e todas estão no contrato:

1. **O valor que está sendo corrigido.** Normalmente o valor mensal atual, e não
   o valor original do contrato — cada reajuste parte do resultado do anterior.
2. **O índice escrito na cláusula.** Em contrato de condomínio costuma ser
   IGP-M, IPCA ou INPC. Não presuma: contratos de manutenção e de limpeza
   frequentemente usam índices diferentes dentro do mesmo prédio.
3. **O período de correção.** Em geral os 12 meses anteriores ao mês de
   aniversário, mas a cláusula pode definir outra janela — e é ela que vale.

Se a cláusula não disser qual índice, ou disser "índice oficial" sem nomear,
isso não é detalhe de redação: é o ponto em que a discussão com o fornecedor
deixa de ter resposta objetiva. Anote para corrigir no próximo aditivo.

## A conta: multiplicar, nunca somar

Aqui está o erro mais comum, e ele favorece quem cobra.

A variação acumulada de um índice **não é a soma** das variações mensais. Cada
mês incide sobre o resultado do mês anterior, então os percentuais se compõem.
Um índice de 1% ao mês por 12 meses não dá 12%: dá **12,68%**. Parece pouca
diferença; num contrato de R$ 5.000, são R$ 34 por mês que ninguém percebe, e
que voltam no ano seguinte porque a base já subiu.

A fórmula é a multiplicação dos fatores mensais:

```
fator = (1 + i₁) × (1 + i₂) × ... × (1 + i₁₂)
valor novo = valor atual × fator
```

Onde cada `i` é a variação daquele mês em decimal — 0,42% vira 0,0042.

Na planilha, com as doze variações em porcentagem na coluna A:

```
=B1 * PRODUTO(1 + A1:A12/100)
```

Em que `B1` é o valor atual. Feche a fórmula com `Ctrl+Shift+Enter` se sua
planilha for antiga.

## Onde achar a série oficial

Todos esses índices estão no **Sistema Gerenciador de Séries Temporais do Banco
Central**, que é público, gratuito e não exige cadastro. Você escolhe a série,
o período, e ele devolve a variação de cada mês:

- **IPCA** — série 433
- **IGP-M** — série 189
- **INPC** — série 188

Use sempre a fonte oficial, e não o número que circula em notícia: matéria de
jornal costuma arredondar e às vezes cita o acumulado de 12 meses de um mês
diferente do seu período.

## O detalhe que mais gera discussão: a defasagem

Índice de um mês não sai no mesmo mês. O IGP-M de agosto é divulgado no fim de
agosto; o IPCA de agosto sai em meados de setembro. Então um contrato que
reajusta em 1º de setembro **não tem** o índice de agosto fechado a tempo, e a
cláusula precisa dizer o que fazer: normalmente ela usa o período que termina
dois meses antes.

Quando o fornecedor usa um período diferente do que a cláusula define, o valor
sai errado sem que ninguém tenha agido de má-fé. É a divergência mais frequente
e a mais fácil de resolver: mostre a cláusula, mostre o período, refaça a conta.

## Um exemplo completo

Contrato de manutenção de elevadores, R$ 2.100,00 por mês, corrigido pelo IPCA.
No período da cláusula, o IPCA acumulado foi de **3,81%**.

| | |
|---|---|
| Valor atual | R$ 2.100,00 |
| Índice acumulado no período | 3,81% |
| **Valor devido** | **R$ 2.180,06** |
| Valor cobrado pelo fornecedor | R$ 2.190,00 |
| **Diferença** | **R$ 9,94 por mês** |

Dez reais. Parece irrelevante — e é justamente por parecer que ninguém confere.
Só que são R$ 119,28 no ano, num contrato só; e o reajuste do ano seguinte
parte de R$ 2.190,00 em vez de R$ 2.180,06, então a diferença não some: ela
cresce. Num prédio com oito contratos, o mesmo descuido repetido oito vezes é
uma linha inteira da prestação de contas.

## O que fazer quando a conta não bate

Não comece acusando. Na maioria das vezes o erro é de período ou de índice, não
de intenção.

1. **Escreva a conta.** Valor de partida, índice, período, variação acumulada,
   valor devido, valor cobrado, diferença.
2. **Cite a cláusula** que define o índice e o período, com o número.
3. **Peça a memória de cálculo do fornecedor.** Quem calculou certo manda em
   cinco minutos; quem não calculou vai recalcular.
4. **Registre por escrito**, mesmo que a conversa comece no telefone. Se a
   diferença for reconhecida, o acerto costuma ser retroativo.

A frase que resolve é objetiva: *"pela cláusula 8.2, o índice é o IPCA do
período de X a Y, que acumulou 3,81%. O valor devido é R$ 2.180,06 e o boleto
veio R$ 2.190,00."* Isso é uma conta, e conta se confere. "Acho que subiu
demais" é opinião, e opinião se discute para sempre.

## Antes do próximo aniversário

Duas coisas evitam a discussão inteira no ano que vem:

**Anote a data.** O reajuste chega junto com o boleto, e a essa altura discutir
já é reclamação. Saber que o aniversário do contrato é em março coloca a
conferência antes da cobrança.

**Confira a cláusula agora, não em março.** Se ela não nomear o índice ou não
definir o período, esse é o problema a resolver — e o momento de resolver é
quando não há dinheiro em disputa na mesa.
