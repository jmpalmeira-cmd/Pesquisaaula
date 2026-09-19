const questions = [
  { title: "Qual é o principal resultado que você gostaria de conquistar hoje?", help: "Pense no resultado que mais faria diferença para você agora." },
  { title: "O que mais está te impedindo de chegar nesse resultado?", help: "Pode ser uma dificuldade prática, uma dúvida ou algo do seu contexto." },
  { title: "O que mais tem te frustrado nesse processo?", help: "" },
  { title: "O que você já tentou fazer para resolver isso?", help: "Conte o que funcionou, o que não funcionou ou o que você abandonou pelo caminho." },
  { title: "Por que você acha que ainda não conseguiu chegar no resultado que gostaria?", help: "" },
  { title: "Quando você pensa em conseguir mais resultados nessa área, existe alguma dúvida ou receio que aparece?", help: "Se sim, qual?" },
  { title: "Tem alguma coisa que faz você pensar que talvez isso seja mais difícil no seu caso?", help: "" },
  { title: "O que faria você se sentir mais confiante de que esse caminho pode funcionar para você?", help: "" },
  { title: "Se eu pudesse responder uma única pergunta sua durante a aula, qual seria?", help: "" },
  { title: "O que eu precisaria te mostrar nessa aula para ela valer muito a pena para você?", help: "" },
];

const steps = [
  {
    key: "name",
    title: "Como podemos te chamar?",
    help: "Digite seu nome para identificarmos sua resposta.",
    type: "text",
    placeholder: "Seu nome",
    maxLength: 120,
  },
  {
    key: "phone",
    title: "Qual é o seu celular com DDD?",
    help: "Usaremos seu contato apenas para comunicações sobre esta aula.",
    type: "tel",
    placeholder: "(11) 99999-9999",
    maxLength: 16,
  },
  ...questions.map((question, index) => ({
    ...question,
    key: `q${index + 1}`,
    type: "long-text",
    placeholder: "Escreva sua resposta aqui...",
    maxLength: 2000,
  })),
];

const storageKey = "pesquisa-aula-respostas";
const endpoint = window.PESQUISA_CONFIG?.sheetsEndpoint?.trim() || "";
const intro = document.querySelector("#intro");
const form = document.querySelector("#surveyForm");
const questionPanel = document.querySelector("#questionPanel");
const success = document.querySelector("#success");
const errorState = document.querySelector("#errorState");
const progressWrap = document.querySelector("#progressWrap");
const progressBar = document.querySelector("#progressBar");
const progressLabel = document.querySelector("#progressLabel");
const progressTrack = document.querySelector(".progress-track");
const questionNumber = document.querySelector("#questionNumber");
const questionTitle = document.querySelector("#questionTitle");
const questionHelp = document.querySelector("#questionHelp");
const answer = document.querySelector("#answer");
const shortAnswer = document.querySelector("#shortAnswer");
const charCount = document.querySelector("#charCount");
const maxCount = document.querySelector("#maxCount");
const fieldMessage = document.querySelector("#fieldMessage");
const nextButton = document.querySelector("#nextButton");

let current = 0;
let responses = loadDraft();

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved && !Array.isArray(saved) && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function currentControl() {
  return steps[current].type === "long-text" ? answer : shortAnswer;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function animatePanel(panel) {
  panel.classList.remove("is-entering");
  requestAnimationFrame(() => panel.classList.add("is-entering"));
}

function renderQuestion() {
  const item = steps[current];
  const step = current + 1;
  questionNumber.textContent = String(step).padStart(2, "0");
  questionTitle.textContent = item.title;
  questionHelp.textContent = item.help;
  const usesLongText = item.type === "long-text";
  answer.hidden = !usesLongText;
  shortAnswer.hidden = usesLongText;
  const control = currentControl();
  questionTitle.setAttribute("for", control.id);
  control.type = item.type === "tel" ? "tel" : "text";
  control.autocomplete = item.type === "tel" ? "tel" : item.type === "text" ? "name" : "off";
  control.inputMode = item.type === "tel" ? "tel" : "text";
  control.placeholder = item.placeholder;
  control.maxLength = item.maxLength;
  control.value = responses[item.key] || "";
  charCount.textContent = control.value.length;
  maxCount.textContent = item.maxLength;
  progressLabel.textContent = `${step} de ${steps.length}`;
  progressBar.style.width = `${(step / steps.length) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(step));
  nextButton.firstChild.textContent = current === steps.length - 1 ? "Enviar respostas " : "Continuar ";
  clearError();
  animatePanel(questionPanel);
  window.setTimeout(() => control.focus({ preventScroll: true }), 220);
}

function clearError() {
  answer.classList.remove("has-error");
  shortAnswer.classList.remove("has-error");
  fieldMessage.classList.remove("error");
  fieldMessage.textContent = "Conte com suas palavras.";
}

function showFieldError(message = "Escreva uma resposta para continuar.") {
  const control = currentControl();
  control.classList.add("has-error");
  fieldMessage.classList.add("error");
  fieldMessage.textContent = message;
  control.focus();
}

function persistCurrent() {
  const item = steps[current];
  responses[item.key] = currentControl().value.trim();
  localStorage.setItem(storageKey, JSON.stringify(responses));
}

function showSurvey() {
  intro.hidden = true;
  questionPanel.hidden = false;
  progressWrap.hidden = false;
  renderQuestion();
}

async function submitResponses() {
  const payload = {
    responseId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    submittedAt: new Date().toISOString(),
    name: responses.name,
    phone: responses.phone,
    answers: Object.fromEntries(questions.map((_, index) => [`q${index + 1}`, responses[`q${index + 1}`] || ""])),
  };

  if (!endpoint) {
    throw new Error("Endpoint do Google Sheets ainda não configurado.");
  }

  nextButton.disabled = true;
  nextButton.firstChild.textContent = "Enviando ";
  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  localStorage.removeItem(storageKey);
  form.hidden = true;
  progressWrap.hidden = true;
  success.hidden = false;
  animatePanel(success);
}

document.querySelector("#startButton").addEventListener("click", showSurvey);

function handleInput(event) {
  if (steps[current].type === "tel") {
    event.target.value = formatPhone(event.target.value);
  }
  charCount.textContent = event.target.value.length;
  if (event.target.value.trim()) clearError();
}

function handleShortcut(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    form.requestSubmit();
  }
}

answer.addEventListener("input", handleInput);
shortAnswer.addEventListener("input", handleInput);
answer.addEventListener("keydown", handleShortcut);
shortAnswer.addEventListener("keydown", handleShortcut);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const item = steps[current];
  const value = currentControl().value.trim();
  if (!value) {
    showFieldError();
    return;
  }
  if (item.type === "tel" && !/^\d{10,11}$/.test(value.replace(/\D/g, ""))) {
    showFieldError("Digite um celular válido com DDD.");
    return;
  }

  persistCurrent();
  if (current < steps.length - 1) {
    current += 1;
    renderQuestion();
    return;
  }

  try {
    await submitResponses();
  } catch (error) {
    console.error(error);
    form.hidden = true;
    progressWrap.hidden = true;
    errorState.hidden = false;
    animatePanel(errorState);
  } finally {
    nextButton.disabled = false;
  }
});

document.querySelector("#backButton").addEventListener("click", () => {
  persistCurrent();
  if (current === 0) {
    questionPanel.hidden = true;
    progressWrap.hidden = true;
    intro.hidden = false;
    animatePanel(intro);
    return;
  }
  current -= 1;
  renderQuestion();
});

document.querySelector("#retryButton").addEventListener("click", async () => {
  errorState.hidden = true;
  form.hidden = false;
  questionPanel.hidden = false;
  progressWrap.hidden = false;
  try {
    await submitResponses();
  } catch (error) {
    console.error(error);
    form.hidden = true;
    progressWrap.hidden = true;
    errorState.hidden = false;
  }
});
