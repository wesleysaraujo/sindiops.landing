"""
Deriva os pontos de corte do vídeo 1 a partir dos marcos do próprio take.

Ponto de corte fixo não sobrevive a esta cena: a espera da consulta é uma
chamada a modelo e varia de 2 a 40 segundos. Numa regravação com números fixos,
tudo deslocou e o pôster caiu na tela de "Consultando os documentos vigentes" em
vez da gaveta com o artigo — o pôster é exatamente o que fica parado na tela de
quem tem prefers-reduced-motion ou abriu com a rede ruim.

Os marcos vêm do relógio do script e o vídeo tem o seu próprio; a diferença é
constante e se cancela ao reancorar pela duração real do arquivo.

Imprime: INICIO FIM POSTER
"""
import json
import subprocess
import sys

video, marcos_json = sys.argv[1], sys.argv[2]

marcos = json.load(open(marcos_json))
duracao = float(subprocess.run(
    ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
    capture_output=True, text=True, check=True).stdout.strip())

offset = duracao - marcos['fim']

inicio = max(marcos['inicio'] + offset - 0.3, 0.0)
fim = duracao - 0.15
# Dois segundos depois de a gaveta abrir: o suficiente para a animação terminar
# e o texto do artigo estar legível parado.
poster = min(marcos['gaveta'] + offset + 2.2, fim - 0.3)

print(f'{inicio:.2f} {fim:.2f} {poster:.2f}')
