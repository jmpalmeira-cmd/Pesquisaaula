# Pesquisaaula

Formulário conversacional para entender objetivos, dificuldades e dúvidas dos participantes antes de uma aula. A experiência mostra uma pergunta por vez, salva o rascunho no dispositivo e envia as respostas para uma planilha do Google Sheets.

## Configurar o Google Sheets

1. Abra a [planilha de respostas](https://docs.google.com/spreadsheets/d/1pK3i2xA8cpyUVPYDfhzVhCj0zqxiB6_9rMhnKYNCSWQ/edit).
2. Em `Extensões > Apps Script`, cole o conteúdo de `google-apps-script/Code.gs`.
3. Clique em `Implantar > Nova implantação > App da Web`.
4. Execute como você e permita acesso para qualquer pessoa.
5. Copie a URL terminada em `/exec` e cole em `dist/config.js` no campo `sheetsEndpoint`.

Depois disso, cada envio será adicionado à aba `Respostas`.

## Desenvolvimento local

Sirva a pasta `dist` com qualquer servidor HTTP estático. Exemplo:

```bash
python3 -m http.server 8000 --directory dist
```
