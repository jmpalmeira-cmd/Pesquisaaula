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
const charCount = document.querySelector("#charCount");
const fieldMessage = document.querySelector("#fieldMessage");
const nextButton = document.querySelector("#nextButton");

let current = 0;
let responses = loadDraft();

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) ? saved.slice(0, questions.length) : [];
  } catch {
    return [];
  }
}

function animatePanel(panel) {
  panel.classList.remove("is-entering");
  requestAnimationFrame(() => panel.classList.add("is-entering"));
}

function renderQuestion() {
  const item = questions[current];
  const step = current + 1;
  questionNumber.textContent = String(step).padStart(2, "0");
  questionTitle.textContent = item.title;
  questionHelp.textContent = item.help;
  answer.value = responses[current] || "";
  charCount.textContent = answer.value.length;
  progressLabel.textContent = `${step} de ${questions.length}`;
  progressBar.style.width = `${(step / questions.length) * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(step));
  nextButton.firstChild.textContent = current === questions.length - 1 ? "Enviar respostas " : "Continuar ";
  clearError();
  animatePanel(questionPanel);
  window.setTimeout(() => answer.focus({ preventScroll: true }), 220);
}

function clearError() {
  answer.classList.remove("has-error");
  fieldMessage.classList.remove("error");
  fieldMessage.textContent = "Conte com suas palavras.";
}

function showFieldError() {
  answer.classList.add("has-error");
  fieldMessage.classList.add("error");
  fieldMessage.textContent = "Escreva uma resposta para continuar.";
  answer.focus();
}

function persistCurrent() {
  responses[current] = answer.value.trim();
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
    answers: Object.fromEntries(responses.map((value, index) => [`q${index + 1}`, value])),
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

answer.addEventListener("input", () => {
  charCount.textContent = answer.value.length;
  if (answer.value.trim()) clearError();
});

answer.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!answer.value.trim()) {
    showFieldError();
    return;
  }

  persistCurrent();
  if (current < questions.length - 1) {
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
