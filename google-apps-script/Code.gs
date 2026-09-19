const SPREADSHEET_ID = "1pK3i2xA8cpyUVPYDfhzVhCj0zqxiB6_9rMhnKYNCSWQ";
const SHEET_NAME = "Respostas";

const HEADERS = [
  "Data e hora",
  "ID da resposta",
  "Nome",
  "Celular",
  "1. Principal resultado",
  "2. Principal impedimento",
  "3. Maior frustração",
  "4. O que já tentou",
  "5. Por que ainda não conseguiu",
  "6. Dúvida ou receio",
  "7. Por que seria mais difícil",
  "8. O que aumentaria a confiança",
  "9. Única pergunta",
  "10. O que faria a aula valer a pena",
];

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse(event.postData.contents);
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#101828")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    const answers = payload.answers || {};
    sheet.appendRow([
      payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
      payload.responseId || Utilities.getUuid(),
      payload.name || "",
      payload.phone || "",
      ...Array.from({ length: 10 }, (_, index) => answers[`q${index + 1}`] || ""),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Pesquisa da aula" }))
    .setMimeType(ContentService.MimeType.JSON);
}
