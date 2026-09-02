#!/usr/bin/env bash
# Monta o corte final a partir do take bruto.
#
# O take é longo porque uma das cenas depende de uma chamada a modelo — gravar
# no timing exato é impossível. Aqui os segmentos viram um filme de ~20s.
#
# Uso: editar.sh <entrada.webm> <destino-sem-extensao> <poster-em-segundos> "ini:fim:velocidade" ...
set -euo pipefail

ENTRADA="$1"; DESTINO="$2"; POSTER_T="$3"; shift 3
TMP=$(mktemp -d)
LISTA="$TMP/lista.txt"; : > "$LISTA"

# O Playwright grava com frame rate variável, e os timestamps do webm não
# mapeiam linearmente para o relógio do script. Cortar direto no take bruto
# entrega o quadro errado — a cena da digitação vinha como a da espera. Um
# passe de normalização a 30 fps constante faz `-ss` cair onde se pediu.
ffmpeg -y -loglevel error -i "$ENTRADA" -fps_mode cfr -r 30 -c:v libx264 -crf 18 \
  -preset veryfast -pix_fmt yuv420p -an "$TMP/normalizado.mp4"
ENTRADA="$TMP/normalizado.mp4"

i=0
for SEG in "$@"; do
  INI="${SEG%%:*}"; RESTO="${SEG#*:}"; FIM="${RESTO%%:*}"; VEL="${RESTO##*:}"
  DUR=$(echo "$FIM - $INI" | bc -l)
  PTS=$(echo "1 / $VEL" | bc -l)
  # `-ss` antes de `-i` busca por keyframe e erra o ponto; depois de `-i` é
  # exato, que é o que importa quando o corte cai no meio de um gesto.
  ffmpeg -y -loglevel error -i "$ENTRADA" -ss "$INI" -t "$DUR" \
    -vf "setpts=${PTS}*PTS,fps=30" -an "$TMP/seg$i.mp4"
  echo "file '$TMP/seg$i.mp4'" >> "$LISTA"
  i=$((i+1))
done

ffmpeg -y -loglevel error -f concat -safe 0 -i "$LISTA" -c copy "$TMP/bruto.mp4"

# H.264 para o mp4 e VP9 para o webm: os dois `<source>` que a landing declara.
# `faststart` põe o índice no começo do arquivo — sem ele o navegador baixa
# tudo antes de mostrar o primeiro quadro.
ffmpeg -y -loglevel error -i "$TMP/bruto.mp4" \
  -c:v libx264 -profile:v high -crf 30 -preset slow -pix_fmt yuv420p \
  -movflags +faststart -an "${DESTINO}.mp4"

ffmpeg -y -loglevel error -i "$TMP/bruto.mp4" \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -an "${DESTINO}.webm"

# Pôster: é o que fica na tela de quem tem prefers-reduced-motion e de quem
# abre com a rede ruim. Precisa contar a história sozinho.
# Via PNG e `cwebp`: o ffmpeg desta máquina foi compilado sem o encoder webp,
# e o cwebp é do próprio projeto WebP — comprime melhor de qualquer forma.
ffmpeg -y -loglevel error -i "$TMP/bruto.mp4" -ss "$POSTER_T" -frames:v 1 "$TMP/poster.png"
cwebp -quiet -q 82 "$TMP/poster.png" -o "${DESTINO}-poster.webp"

rm -rf "$TMP"
for f in "${DESTINO}.mp4" "${DESTINO}.webm" "${DESTINO}-poster.webp"; do
  printf '%-52s %7s KB  %ss\n' "$(basename "$f")" \
    "$(( $(stat -f%z "$f") / 1024 ))" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null | cut -c1-5)"
done
