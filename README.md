# Pesquisaaula

Formulário conversacional para identificar os participantes e entender objetivos, dificuldades e dúvidas antes de uma aula. A experiência mostra uma pergunta por vez, salva o rascunho no dispositivo e envia nome, celular e respostas para uma planilha do Google Sheets.

## Respostas

O formulário já está integrado à [planilha de respostas](https://docs.google.com/spreadsheets/d/1pK3i2xA8cpyUVPYDfhzVhCj0zqxiB6_9rMhnKYNCSWQ/edit). Cada envio é adicionado automaticamente à aba `Respostas`, com data e hora, identificador, nome, celular e as dez respostas.

Se `google-apps-script/Code.gs` for alterado, publique uma nova versão pelo menu `Implantar > Gerenciar implantações` do Apps Script.

## Desenvolvimento local

Sirva a pasta `dist` com qualquer servidor HTTP estático. Exemplo:

```bash
python3 -m http.server 8000 --directory dist
```
