#!/usr/bin/env bash
# Grava os dois vídeos da landing e instala os arquivos em public/img/.
#
# Pré-requisitos, nesta ordem:
#   1. docker compose up -d          (no app.sindiops, inclusive o worker)
#   2. php artisan demo:prepare --fresh
#   3. esperar documentos "Pronto" e propostas "Conferir"
#   4. npm install && npx playwright install chromium   (aqui)
set -euo pipefail
cd "$(dirname "$0")"

APP="${APP:-../../../app.sindiops}"
BASE="${BASE:-http://localhost:8020}"
DESTINO="${DESTINO:-../../public/img}"

# Os UUIDs saem do banco, não de raspar HTML: script que adivinha onde clicar
# grava a tela errada em silêncio.
uuid() {
  docker compose --project-directory "$APP" exec -T app php artisan tinker --execute="
    \$t = App\Models\Tenant::where('slug','demonstracao')->first();
    app(App\Support\TenantContext::class)->set(\$t->id);
    echo 'X'.$1;
  " 2>/dev/null | grep -o 'X[0-9a-f-]\{36\}' | head -1 | cut -c2-
}

export CONDO=$(uuid "App\Models\Condominium::first()->uuid")
export ORC=$(uuid "App\Models\BudgetRequest::first()->uuid")
export QUOTE=$(uuid "App\Models\Quote::whereHas('supplier', fn(\$q) => \$q->where('name','Impermeasul'))->first()->uuid")

[ -z "$CONDO" ] && { echo "Cenário ausente. Rode: php artisan demo:prepare --fresh"; exit 1; }

# A consulta é cacheada por pergunta e versão de documento. Sem limpar, a
# resposta volta instantânea e o vídeo esconde a espera que o produto tem de
# verdade — que é justamente o que não se quer esconder.
docker compose --project-directory "$APP" exec -T app php artisan tinker --execute="
  \$t = App\Models\Tenant::where('slug','demonstracao')->first();
  app(App\Support\TenantContext::class)->set(\$t->id);
  App\Models\Query::withTrashed()->forceDelete();
" >/dev/null 2>&1

echo "→ vídeo 1 (consulta)";   node video1.mjs
echo "→ vídeo 2 (orçamento)";  node video2.mjs

mkdir -p "$DESTINO"
./editar.sh "$(ls -t saida/video1/*.webm | head -1)" "$DESTINO/demo-notificacao" 19.5 "0.4:22.3:1"
./editar.sh "$(ls -t saida/video2/*.webm | head -1)" "$DESTINO/demo-orcamento"   17.5 "0.5:20.1:1"

echo
echo "Instalados em $DESTINO. Confira os pôsteres antes de commitar:"
echo "eles são o que fica na tela de quem tem prefers-reduced-motion."
