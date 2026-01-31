import QRCode from "qrcode";

const STORAGE_KEY = "ryf:game";
const HASH_PREFIX = "g";
const LANG_STORAGE_KEY = "ryf:lang";

const translations = {
  en: {
    app: {
      title: "Ranking Your Friends",
      subtitle:
        "A playful party game: pick juicy questions, rank each other, and reveal the funniest results round by round.",
      intro:
        "No accounts, no logins. The host locks the game, players send a short secret code, and the host runs a big-screen style reveal.",
    },
    nav: {
      setup: "1. Setup",
      host: "2. Collect Codes",
    },
    setup: {
      title: "Setup",
      description:
        "Add players and questions. When you lock the game, the setup freezes and a share link is generated for your players.",
      gameTitle: "Game title",
      gameTitlePlaceholder: "Friday night rankings",
      players: "Players",
      questions: "Questions",
      lockTitle: "Lock the game",
      lockDescription: "Locking freezes players and questions, and generates the share link.",
      lockButton: "Lock game & create link",
      goHost: "Go to collect codes",
      shareTitle: "Share link",
      shareCopy: "Copy",
      shareHint: "Send this link to each player.",
      gameCode: "Game code (backup)",
    },
    player: {
      title: "Player",
      description: "Pick your name, rank everyone for each question, then copy your secret code.",
      selectName: "Select your name",
      start: "Start",
      nextQuestion: "Next question",
      finish: "Finish & get code",
      thanks: "Thanks! Send this to your host",
      submitHint: "Copy your secret code below and send it via WhatsApp or email.",
      secretCode: "Your secret code",
      copyCode: "Copy code",
    },
    host: {
      title: "Collect Codes",
      description: "Paste each player's code below (one per line). When all are in, start the reveal.",
      pasteTitle: "Paste codes",
      pasteHint: "Each line: name:code",
      pastePlaceholder: "alice:abc123\nbob:def456",
      import: "Import lines",
      status: "Submission status",
      startReveal: "Generate game night link",
      revealTitle: "Game night link",
      revealHint: "Open this on the big screen, or share as a QR code.",
      openReveal: "Open reveal",
    },
    reveal: {
      title: "Reveal",
      readyTitle: "Ready to present?",
      readyHint: "Go fullscreen for the best vibe.",
      fullscreen: "Go fullscreen",
      skipFullscreen: "Continue without fullscreen",
      chooseScoring: "Choose scoring",
      simpleTitle: "Simple (exact ranks)",
      simpleDesc:
        "Score 1 point for every player placed in the exact position (e.g. John is fourth).",
      simpleProsLabel: "Pros:",
      simplePros: "easy to explain and highlights perfect hits.",
      simpleConsLabel: "Cons:",
      simpleCons: "near-misses get no credit.",
      weightedTitle: "Weighted (distance-based)",
      weightedDesc:
        "Score more points when your ranking is closer to the group consensus and fewer points when you are far off.",
      weightedProsLabel: "Pros:",
      weightedPros: "rewards close guesses and keeps scores tight.",
      weightedConsLabel: "Cons:",
      weightedCons: "needs a quick explanation before playing.",
      promptTitle: "Presenter, come forward",
      promptLine:
        "{presenter} kicks things off. Read the question out loud before the reveal begins.",
      questionLabel: "Question",
      presenterNote: "Presenter:",
      presenterVsGroup: "Presenter vs group average",
      roundScore: "Round score",
      totalScore: "Total score",
      back: "Back",
      next: "Next",
    },
    labels: {
      addPlayer: "Add player",
      addQuestion: "Add question",
      remove: "Remove",
      copy: "Copy",
      addPlayersFirst: "Add players first",
      unnamed: "(unnamed)",
      selectPlaceholder: "Select...",
      untitledQuestion: "Untitled question",
      unknown: "Unknown",
      drag: "Drag",
      up: "Up",
      down: "Down",
      submitted: "Submitted",
      missing: "Missing",
      presenterTbd: "Presenter TBD",
      noQuestions: "No questions",
      presenter: "Presenter",
      groupAvg: "Group avg",
      match: "Match",
      noMatch: "No match",
    },
    errors: {
      shareTooLong: "Share link is too long. Reduce players or questions.",
      shareLong: "Share link is getting long. Consider fewer questions.",
      addPlayers: "Add at least two players.",
      uniquePlayers: "Player names must be unique.",
      addQuestions: "Add at least one question.",
      completeQuestions: "Complete all questions before finishing.",
      lineFormat: "Each line must be name:code.",
      unknownPlayer: "Unknown player name: {name}",
      gameMismatch: "Game mismatch for {name}.",
      playerMismatch: "Player mismatch for {name}.",
      duplicateSubmission: "Duplicate submission for {name}.",
      invalidPayload: "Invalid payload for {name}.",
    },
    scoring: {
      roundSimple: "Points this round: 1 point for each exact placement match.",
      roundWeighted: "Points this round: more points for rankings closer to the group consensus.",
      totalSimple: "Running total with simple scoring (shown starting in round 2).",
      totalWeighted: "Running total with weighted scoring (shown starting in round 2).",
    },
    language: {
      label: "Language",
    },
  },
  nl: {
    app: {
      title: "Ranking Your Friends",
      subtitle:
        "Een speels partyspel: kies sappige vragen, rangschik elkaar en onthul de grappigste resultaten ronde na ronde.",
      intro:
        "Geen accounts, geen logins. De host vergrendelt het spel, spelers sturen een korte geheime code en de host toont de onthulling op groot scherm.",
    },
    nav: {
      setup: "1. Instellen",
      host: "2. Codes verzamelen",
    },
    setup: {
      title: "Instellen",
      description:
        "Voeg spelers en vragen toe. Wanneer je het spel vergrendelt, wordt de setup bevroren en wordt er een deel-link voor spelers gemaakt.",
      gameTitle: "Speltitel",
      gameTitlePlaceholder: "Vrijdagavond ranglijst",
      players: "Spelers",
      questions: "Vragen",
      lockTitle: "Spel vergrendelen",
      lockDescription: "Vergrendelen bevriest spelers en vragen en maakt de deel-link aan.",
      lockButton: "Spel vergrendelen & link maken",
      goHost: "Ga naar codes verzamelen",
      shareTitle: "Deel-link",
      shareCopy: "Kopiëren",
      shareHint: "Stuur deze link naar elke speler.",
      gameCode: "Spelcode (back-up)",
    },
    player: {
      title: "Speler",
      description: "Kies je naam, rangschik iedereen per vraag en kopieer daarna je geheime code.",
      selectName: "Kies je naam",
      start: "Start",
      nextQuestion: "Volgende vraag",
      finish: "Afronden & code krijgen",
      thanks: "Bedankt! Stuur dit naar je host",
      submitHint: "Kopieer je geheime code hieronder en verstuur via WhatsApp of e-mail.",
      secretCode: "Jouw geheime code",
      copyCode: "Code kopiëren",
    },
    host: {
      title: "Codes verzamelen",
      description:
        "Plak de code van elke speler hieronder (één per regel). Start de reveal zodra alles binnen is.",
      pasteTitle: "Codes plakken",
      pasteHint: "Elke regel: naam:code",
      pastePlaceholder: "alice:abc123\nbob:def456",
      import: "Regels importeren",
      status: "Inzendingenstatus",
      startReveal: "Spelavond-link maken",
      revealTitle: "Spelavond-link",
      revealHint: "Open dit op het grote scherm of deel als QR-code.",
      openReveal: "Reveal openen",
    },
    reveal: {
      title: "Reveal",
      readyTitle: "Klaar om te presenteren?",
      readyHint: "Ga fullscreen voor de beste vibe.",
      fullscreen: "Ga fullscreen",
      skipFullscreen: "Ga door zonder fullscreen",
      chooseScoring: "Kies scoremethode",
      simpleTitle: "Simpel (exacte posities)",
      simpleDesc:
        "Scoor 1 punt voor elke speler die je op de exacte positie zet (bijv. John is vierde).",
      simpleProsLabel: "Voordelen:",
      simplePros: "makkelijk uit te leggen en benadrukt perfecte hits.",
      simpleConsLabel: "Nadelen:",
      simpleCons: "bijna-goed levert geen punten op.",
      weightedTitle: "Gewogen (afstand)",
      weightedDesc:
        "Scoor meer punten als je ranking dichter bij de groepsconsensus ligt en minder punten als je er ver naast zit.",
      weightedProsLabel: "Voordelen:",
      weightedPros: "beloont bijna-goed en houdt scores spannend.",
      weightedConsLabel: "Nadelen:",
      weightedCons: "heeft een korte uitleg nodig voordat je start.",
      promptTitle: "Presentator, kom naar voren",
      promptLine:
        "{presenter} trapt af. Lees de vraag hardop voordat de reveal begint.",
      questionLabel: "Vraag",
      presenterNote: "Presentator:",
      presenterVsGroup: "Presentator vs groepsgemiddelde",
      roundScore: "Rondescore",
      totalScore: "Totaalscore",
      back: "Terug",
      next: "Volgende",
    },
    labels: {
      addPlayer: "Speler toevoegen",
      addQuestion: "Vraag toevoegen",
      remove: "Verwijderen",
      copy: "Kopiëren",
      addPlayersFirst: "Voeg eerst spelers toe",
      unnamed: "(naamloos)",
      selectPlaceholder: "Selecteer...",
      untitledQuestion: "Naamloze vraag",
      unknown: "Onbekend",
      drag: "Sleep",
      up: "Omhoog",
      down: "Omlaag",
      submitted: "Ingediend",
      missing: "Ontbreekt",
      presenterTbd: "Presentator nog te bepalen",
      noQuestions: "Geen vragen",
      presenter: "Presentator",
      groupAvg: "Groepsgem.",
      match: "Match",
      noMatch: "Geen match",
    },
    errors: {
      shareTooLong: "De deel-link is te lang. Verminder spelers of vragen.",
      shareLong: "De deel-link wordt lang. Overweeg minder vragen.",
      addPlayers: "Voeg minstens twee spelers toe.",
      uniquePlayers: "Spelernamen moeten uniek zijn.",
      addQuestions: "Voeg minstens één vraag toe.",
      completeQuestions: "Maak alle vragen af voordat je afrondt.",
      lineFormat: "Elke regel moet naam:code zijn.",
      unknownPlayer: "Onbekende spelernaam: {name}",
      gameMismatch: "Spel komt niet overeen voor {name}.",
      playerMismatch: "Speler komt niet overeen voor {name}.",
      duplicateSubmission: "Dubbele inzending voor {name}.",
      invalidPayload: "Ongeldige payload voor {name}.",
    },
    scoring: {
      roundSimple: "Punten deze ronde: 1 punt voor elke exacte plaatsing.",
      roundWeighted: "Punten deze ronde: meer punten als je ranking dichter bij de groep ligt.",
      totalSimple: "Totaalscore met simpele scoring (vanaf ronde 2).",
      totalWeighted: "Totaalscore met gewogen scoring (vanaf ronde 2).",
    },
    language: {
      label: "Taal",
    },
  },
};

const state = {
  view: "setup",
  game: null,
  language: "en",
  shareEncoded: "",
  playerForm: {
    playerId: null,
    visibleCount: 1,
    byQuestion: {},
    markedSubmitted: false,
    step: "identity",
  },
  revealIndex: 0,
  revealStep: 0,
  revealPhase: "prompt",
  revealFullscreenReady: false,
};

const el = {
  appHeader: document.getElementById("app-header"),
  navBar: document.getElementById("nav-bar"),
  navSetup: document.getElementById("nav-setup"),
  navHost: document.getElementById("nav-host"),
  languageSelect: document.getElementById("language-select"),
  viewSetup: document.getElementById("view-setup"),
  viewPlayer: document.getElementById("view-player"),
  viewHost: document.getElementById("view-host"),
  viewReveal: document.getElementById("view-reveal"),
  gameTitle: document.getElementById("game-title"),
  playersList: document.getElementById("players-list"),
  addPlayer: document.getElementById("add-player"),
  questionsList: document.getElementById("questions-list"),
  addQuestion: document.getElementById("add-question"),
  shareUrl: document.getElementById("share-url"),
  copyShare: document.getElementById("copy-share"),
  finalizedPanel: document.getElementById("finalized-panel"),
  gameCode: document.getElementById("game-code"),
  finalizeGame: document.getElementById("finalize-game"),
  goHost: document.getElementById("go-host"),
  setupError: document.getElementById("setup-error"),
  playerSelect: document.getElementById("player-select"),
  playerConfirm: document.getElementById("player-confirm"),
  playerStepIdentity: document.getElementById("player-step-identity"),
  playerStepQuestions: document.getElementById("player-step-questions"),
  playerStepSubmit: document.getElementById("player-step-submit"),
  playerProgress: document.getElementById("player-progress"),
  playerQuestions: document.getElementById("player-questions"),
  nextQuestion: document.getElementById("next-question"),
  playerFinish: document.getElementById("player-finish"),
  submissionLinePanel: document.getElementById("submission-line-panel"),
  submissionLine: document.getElementById("submission-line"),
  copySubmissionLine: document.getElementById("copy-submission-line"),
  playerError: document.getElementById("player-error"),
  importText: document.getElementById("import-text"),
  importSubmit: document.getElementById("import-submit"),
  importError: document.getElementById("import-error"),
  submissionStatus: document.getElementById("submission-status"),
  startReveal: document.getElementById("start-reveal"),
  revealLinkPanel: document.getElementById("reveal-link-panel"),
  revealUrl: document.getElementById("reveal-url"),
  copyReveal: document.getElementById("copy-reveal"),
  openReveal: document.getElementById("open-reveal"),
  revealQr: document.getElementById("reveal-qr"),
  revealFullscreen: document.getElementById("reveal-fullscreen"),
  revealEnterFullscreen: document.getElementById("reveal-enter-fullscreen"),
  revealSkipFullscreen: document.getElementById("reveal-skip-fullscreen"),
  revealStage: document.getElementById("reveal-stage"),
  revealPrompt: document.getElementById("reveal-prompt"),
  revealPresenterLine: document.getElementById("reveal-presenter-line"),
  revealPresenterLabel: document.getElementById("reveal-presenter-label"),
  revealQuestionPanel: document.getElementById("reveal-question-panel"),
  revealQuestionText: document.getElementById("reveal-question-text"),
  revealRankingPanel: document.getElementById("reveal-ranking-panel"),
  revealRoundScorePanel: document.getElementById("reveal-roundscore-panel"),
  revealTotalPanel: document.getElementById("reveal-total-panel"),
  scoringSimple: document.getElementById("scoring-simple"),
  scoringWeighted: document.getElementById("scoring-weighted"),
  roundScoreExplain: document.getElementById("round-score-explain"),
  totalScoreExplain: document.getElementById("total-score-explain"),
  roundLeaderboard: document.getElementById("round-leaderboard"),
  roundReveal: document.getElementById("round-reveal"),
  totalLeaderboard: document.getElementById("total-leaderboard"),
  revealPrev: document.getElementById("reveal-prev"),
  revealNext: document.getElementById("reveal-next"),
};

function createId(prefix) {
  if (crypto && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getInitialLanguage() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && translations[stored]) return stored;
  const browser = navigator.language ? navigator.language.toLowerCase() : "en";
  if (browser.startsWith("nl")) return "nl";
  return "en";
}

function t(key, vars = {}) {
  const table = translations[state.language] || translations.en;
  const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : null), table);
  if (typeof value !== "string") return key;
  return value.replace(/\{(\w+)\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      return vars[name];
    }
    return match;
  });
}

function applyTranslations() {
  document.documentElement.lang = state.language;
  document.title = t("app.title");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    node.setAttribute("placeholder", t(key));
  });
}

function renderLanguageOptions() {
  if (!el.languageSelect) return;
  el.languageSelect.innerHTML = "";
  Object.keys(translations).forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang === "nl" ? "Nederlands" : "English";
    el.languageSelect.appendChild(option);
  });
  el.languageSelect.value = state.language;
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  state.language = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  applyTranslations();
  renderAll();
}

function emptyGame() {
  return {
    version: 1,
    gameId: createId("game"),
    title: "",
    createdAt: new Date().toISOString(),
    finalizedAt: null,
    players: [],
    questions: [],
    submissions: {},
    settings: { scoring: "weighted", reveal: "rounds" },
  };
}

function parseHash() {
  const raw = location.hash.slice(1);
  const params = new URLSearchParams(raw);
  return {
    view: params.get("v"),
    g: params.get(HASH_PREFIX),
  };
}

function setHash(view, g) {
  const params = new URLSearchParams();
  if (view) params.set("v", view);
  if (g) params.set(HASH_PREFIX, g);
  location.hash = params.toString();
}

function utf8ToBytes(text) {
  return new TextEncoder().encode(text);
}

function bytesToUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

function bytesToBase64url(bytes) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deflateRaw(bytes) {
  if (!("CompressionStream" in window)) return bytes;
  const stream = new CompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const out = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(out);
}

async function inflateRaw(bytes) {
  if (!("DecompressionStream" in window)) return bytes;
  const stream = new DecompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const out = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(out);
}

async function encodeGame(game) {
  const json = JSON.stringify(game);
  const compressed = await deflateRaw(utf8ToBytes(json));
  return bytesToBase64url(compressed);
}

async function decodeGame(encoded) {
  const bytes = base64urlToBytes(encoded);
  const inflated = await inflateRaw(bytes);
  const json = bytesToUtf8(inflated);
  return JSON.parse(json);
}

function saveGameLocal(game) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

function loadGameLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function syncHashFromGame(game, viewOverride) {
  const shareGame = { ...game, submissions: {} };
  const encoded = await encodeGame(shareGame);
  state.shareEncoded = encoded;
  if (encoded.length > 16000) {
    showError(el.setupError, t("errors.shareTooLong"));
    return "";
  }
  if (encoded.length > 8000) {
    showError(el.setupError, t("errors.shareLong"));
  } else {
    hideError(el.setupError);
  }
  if (viewOverride) setHash(viewOverride, encoded);
  updateShareUrl(encoded);
  return encoded;
}

function showError(node, message) {
  node.textContent = message;
  node.classList.remove("hidden");
}

function hideError(node) {
  node.textContent = "";
  node.classList.add("hidden");
}

function updateShareUrl(encoded) {
  const base = location.href.split("#")[0];
  const params = new URLSearchParams();
  params.set("v", "player");
  params.set(HASH_PREFIX, encoded);
  el.shareUrl.value = `${base}#${params.toString()}`;
}

function setView(view) {
  state.view = view;
  el.viewSetup.classList.toggle("hidden", view !== "setup");
  el.viewPlayer.classList.toggle("hidden", view !== "player");
  el.viewHost.classList.toggle("hidden", view !== "host");
  el.viewReveal.classList.toggle("hidden", view !== "reveal");
  el.navBar.classList.toggle("hidden", view === "player");
  el.appHeader.classList.toggle("hidden", view === "reveal");
  if (view === "player") renderPlayerStep();
  el.navSetup.classList.toggle("active", view === "setup");
  el.navHost.classList.toggle("active", view === "host");
}

function ensureGame() {
  if (!state.game) state.game = emptyGame();
}

function ensureSettings() {
  let changed = false;
  if (!state.game.settings) {
    state.game.settings = { scoring: "weighted", reveal: "rounds" };
    changed = true;
  }
  const normalized = normalizeScoring(state.game.settings.scoring);
  if (state.game.settings.scoring !== normalized) {
    state.game.settings.scoring = normalized;
    changed = true;
  }
  if (!state.game.settings.reveal) {
    state.game.settings.reveal = "rounds";
    changed = true;
  }
  if (changed) saveGameLocal(state.game);
}

function getDefaultPresenterId(index) {
  const players = state.game.players;
  if (!players.length) return null;
  const presenter = players[index % players.length];
  return presenter ? presenter.id : null;
}

function ensurePresenter(question, index) {
  const players = state.game.players;
  if (!players.length) {
    question.presenterId = null;
    return false;
  }
  const valid = players.some((player) => player.id === question.presenterId);
  if (!valid) {
    question.presenterId = getDefaultPresenterId(index);
    return true;
  }
  return false;
}

function normalizePresenters() {
  let changed = false;
  state.game.questions.forEach((question, index) => {
    if (ensurePresenter(question, index)) changed = true;
  });
  if (changed) saveGameLocal(state.game);
}

function renderPlayersList() {
  el.playersList.innerHTML = "";
  state.game.players.forEach((player) => {
    const row = document.createElement("div");
    row.className = "list-row";
    const input = document.createElement("input");
    input.type = "text";
    input.value = player.name;
    input.addEventListener("input", () => {
      player.name = input.value;
      saveGameLocal(state.game);
      renderPlayerSelect();
      renderQuestionsList();
    });
    input.disabled = Boolean(state.game.finalizedAt);
    const remove = document.createElement("button");
    remove.className = "btn";
    remove.textContent = t("labels.remove");
    remove.addEventListener("click", () => {
      if (state.game.finalizedAt) return;
      state.game.players = state.game.players.filter((p) => p.id !== player.id);
      saveGameLocal(state.game);
      renderPlayersList();
      renderPlayerSelect();
      renderQuestionsList();
    });
    remove.disabled = Boolean(state.game.finalizedAt);
    row.appendChild(input);
    row.appendChild(remove);
    el.playersList.appendChild(row);
  });
}

function renderQuestionsList() {
  el.questionsList.innerHTML = "";
  state.game.questions.forEach((question, index) => {
    const row = document.createElement("div");
    row.className = "list-row";
    const input = document.createElement("input");
    input.type = "text";
    input.value = question.text;
    input.addEventListener("input", () => {
      question.text = input.value;
      saveGameLocal(state.game);
      renderPlayerQuestion();
    });
    input.disabled = Boolean(state.game.finalizedAt);
    const presenter = document.createElement("select");
    const presenterUpdated = ensurePresenter(question, index);
    if (presenterUpdated) saveGameLocal(state.game);
    presenter.disabled = Boolean(state.game.finalizedAt) || !state.game.players.length;
    if (!state.game.players.length) {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = t("labels.addPlayersFirst");
      presenter.appendChild(emptyOption);
    } else {
      state.game.players.forEach((player) => {
        const option = document.createElement("option");
        option.value = player.id;
        option.textContent = player.name || t("labels.unnamed");
        presenter.appendChild(option);
      });
      presenter.value = question.presenterId || "";
    }
    presenter.addEventListener("change", () => {
      question.presenterId = presenter.value || null;
      saveGameLocal(state.game);
    });
    const remove = document.createElement("button");
    remove.className = "btn";
    remove.textContent = t("labels.remove");
    remove.addEventListener("click", () => {
      if (state.game.finalizedAt) return;
      state.game.questions = state.game.questions.filter((q) => q.id !== question.id);
      saveGameLocal(state.game);
      renderQuestionsList();
      renderPlayerQuestion();
    });
    remove.disabled = Boolean(state.game.finalizedAt);
    row.appendChild(input);
    row.appendChild(presenter);
    row.appendChild(remove);
    el.questionsList.appendChild(row);
  });
}

function renderPlayerSelect() {
  el.playerSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("labels.selectPlaceholder");
  el.playerSelect.appendChild(placeholder);
  state.game.players.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.name || t("labels.unnamed");
    el.playerSelect.appendChild(option);
  });
  if (state.playerForm.playerId) {
    el.playerSelect.value = state.playerForm.playerId;
  }
}

function ensureRanking(questionId) {
  if (!state.playerForm.byQuestion[questionId]) {
    state.playerForm.byQuestion[questionId] = state.game.players.map((p) => p.id);
  }
}

function renderPlayerQuestion() {
  const questions = state.game.questions;
  if (!questions.length) {
    el.playerProgress.textContent = "0 / 0";
    return;
  }
  if (typeof state.playerForm.visibleCount !== "number") {
    state.playerForm.visibleCount = 1;
  }
  const count = Math.min(state.playerForm.visibleCount, questions.length);
  el.playerProgress.textContent = `${count} / ${questions.length}`;
  renderPlayerQuestions(count);
  updatePlayerNav();
}

function renderPlayerStep() {
  el.playerStepIdentity.classList.toggle("hidden", state.playerForm.step !== "identity");
  el.playerStepQuestions.classList.toggle("hidden", state.playerForm.step !== "questions");
  el.playerStepSubmit.classList.toggle("hidden", state.playerForm.step !== "submit");
}

function renderPlayerQuestions(count) {
  el.playerQuestions.innerHTML = "";
  state.game.questions.slice(0, count).forEach((question, index) => {
    ensureRanking(question.id);
    const card = document.createElement("div");
    card.className = "card";
    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${question.text || t("labels.untitledQuestion")}`;
    const list = document.createElement("ul");
    list.className = "ranking-list";
    const ranking = state.playerForm.byQuestion[question.id];
    ranking.forEach((playerId, position) => {
      const player = state.game.players.find((p) => p.id === playerId);
      const li = document.createElement("li");
      li.className = "ranking-item";
      li.draggable = !state.playerForm.markedSubmitted;
      li.dataset.playerId = playerId;
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `${position + 1}. ${player ? player.name : t("labels.unknown")}`;
      const dragSpan = document.createElement("span");
      dragSpan.textContent = t("labels.drag");
      const controls = document.createElement("div");
      controls.className = "rank-controls";
      const up = document.createElement("button");
      up.className = "rank-btn";
      up.type = "button";
      up.textContent = t("labels.up");
      up.disabled = position === 0 || state.playerForm.markedSubmitted;
      up.addEventListener("click", () => moveRanking(question.id, playerId, -1));
      const down = document.createElement("button");
      down.className = "rank-btn";
      down.type = "button";
      down.textContent = t("labels.down");
      down.disabled = position === ranking.length - 1 || state.playerForm.markedSubmitted;
      down.addEventListener("click", () => moveRanking(question.id, playerId, 1));
      controls.appendChild(up);
      controls.appendChild(down);
      li.appendChild(nameSpan);
      li.appendChild(dragSpan);
      li.appendChild(controls);
      if (!state.playerForm.markedSubmitted) attachDragHandlers(li, question.id);
      list.appendChild(li);
    });
    card.appendChild(title);
    card.appendChild(list);
    el.playerQuestions.appendChild(card);
  });
}

function moveRanking(questionId, playerId, delta) {
  const ranking = state.playerForm.byQuestion[questionId];
  const from = ranking.indexOf(playerId);
  const to = Math.max(0, Math.min(ranking.length - 1, from + delta));
  if (from === to) return;
  ranking.splice(from, 1);
  ranking.splice(to, 0, playerId);
  renderPlayerQuestions(state.playerForm.visibleCount);
  refreshSubmissionLine();
}

function attachDragHandlers(li, questionId) {
  li.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", li.dataset.playerId);
  });
  li.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  li.addEventListener("drop", (event) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain");
    const targetId = li.dataset.playerId;
    if (!draggedId || draggedId === targetId) return;
    const ranking = state.playerForm.byQuestion[questionId];
    const from = ranking.indexOf(draggedId);
    const to = ranking.indexOf(targetId);
    ranking.splice(from, 1);
    ranking.splice(to, 0, draggedId);
    renderPlayerQuestions(state.playerForm.visibleCount);
    refreshSubmissionLine();
  });
}

function updatePlayerNav() {
  const total = state.game.questions.length;
  const done = state.playerForm.visibleCount >= total;
  const canFinish = done && canExportSubmission();
  el.nextQuestion.disabled = done;
  el.nextQuestion.classList.toggle("hidden", done);
  el.playerFinish.classList.toggle("hidden", !canFinish);
}

function canExportSubmission() {
  if (!state.playerForm.playerId) return false;
  const questionIds = state.game.questions.map((q) => q.id);
  return questionIds.every((id) => {
    const ranking = state.playerForm.byQuestion[id];
    return ranking && ranking.length === state.game.players.length;
  });
}

function createSubmission() {
  return {
    version: 1,
    gameId: state.game.gameId,
    playerId: state.playerForm.playerId,
    submittedAt: new Date().toISOString(),
    byQuestion: state.playerForm.byQuestion,
  };
}

async function refreshSubmissionLine() {
  if (!canExportSubmission()) return;
  const submission = createSubmission();
  const player = state.game.players.find((p) => p.id === submission.playerId);
  if (!player || !player.name) return;
  const payload = await encodePayload(submission);
  const line = `${player.name}:${payload}`;
  el.submissionLine.value = line;
}

async function encodePayload(obj) {
  const json = JSON.stringify(obj);
  const compressed = await deflateRaw(utf8ToBytes(json));
  return bytesToBase64url(compressed);
}

async function decodePayload(payload) {
  const bytes = base64urlToBytes(payload);
  const inflated = await inflateRaw(bytes);
  return JSON.parse(bytesToUtf8(inflated));
}

function renderSubmissionStatus() {
  el.submissionStatus.innerHTML = "";
  state.game.players.forEach((player) => {
    const row = document.createElement("div");
    row.textContent = `${player.name || t("labels.unnamed")} - ${
      state.game.submissions[player.id] ? t("labels.submitted") : t("labels.missing")
    }`;
    el.submissionStatus.appendChild(row);
  });
  el.startReveal.disabled = !allSubmissionsIn();
}

function allSubmissionsIn() {
  return state.game.players.length > 0 && state.game.players.every((p) => state.game.submissions[p.id]);
}

function buildConsensusRanking(questionId) {
  const totals = {};
  const counts = {};
  state.game.players.forEach((p) => {
    totals[p.id] = 0;
    counts[p.id] = 0;
  });
  Object.values(state.game.submissions).forEach((submission) => {
    const ranking = submission.byQuestion[questionId];
    if (!ranking) return;
    ranking.forEach((playerId, index) => {
      totals[playerId] += index;
      counts[playerId] += 1;
    });
  });
  const ranked = state.game.players.map((player) => {
    const count = counts[player.id] || 1;
    return {
      player,
      average: totals[player.id] / count,
    };
  });
  ranked.sort((a, b) => {
    if (a.average !== b.average) return a.average - b.average;
    return a.player.name.localeCompare(b.player.name);
  });
  return ranked.map((row) => row.player.id);
}

function maxRankDistance(playerCount) {
  let total = 0;
  for (let i = 0; i < playerCount; i += 1) {
    total += Math.abs(i - (playerCount - 1 - i));
  }
  return total;
}

function normalizeScoring(scoring) {
  if (scoring === "descending") return "weighted";
  if (scoring === "simple" || scoring === "weighted") return scoring;
  return "weighted";
}

function getScoringMode() {
  return normalizeScoring(state.game.settings?.scoring);
}

function setScoringMode(value) {
  state.game.settings = { ...state.game.settings, scoring: normalizeScoring(value) };
  saveGameLocal(state.game);
}

function scoreRoundWeighted(questionId) {
  const totals = {};
  state.game.players.forEach((p) => (totals[p.id] = 0));
  const consensusOrder = buildConsensusRanking(questionId);
  if (!consensusOrder.length) return totals;
  const consensusPositions = new Map();
  consensusOrder.forEach((playerId, index) => {
    consensusPositions.set(playerId, index);
  });
  const maxDistance = maxRankDistance(state.game.players.length);
  Object.values(state.game.submissions).forEach((submission) => {
    const ranking = submission.byQuestion[questionId];
    if (!ranking) return;
    const distance = ranking.reduce((sum, playerId, index) => {
      const consensusIndex = consensusPositions.get(playerId);
      if (consensusIndex === undefined) return sum;
      return sum + Math.abs(index - consensusIndex);
    }, 0);
    totals[submission.playerId] += Math.max(0, maxDistance - distance);
  });
  return totals;
}

function scoreRoundSimple(questionId) {
  const totals = {};
  state.game.players.forEach((p) => (totals[p.id] = 0));
  const consensusOrder = buildConsensusRanking(questionId);
  if (!consensusOrder.length) return totals;
  const consensusPositions = new Map();
  consensusOrder.forEach((playerId, index) => {
    consensusPositions.set(playerId, index);
  });
  Object.values(state.game.submissions).forEach((submission) => {
    const ranking = submission.byQuestion[questionId];
    if (!ranking) return;
    ranking.forEach((playerId, index) => {
      const consensusIndex = consensusPositions.get(playerId);
      if (consensusIndex === undefined) return;
      if (consensusIndex === index) {
        totals[submission.playerId] += 1;
      }
    });
  });
  return totals;
}

function scoreRound(questionId, scoring) {
  const mode = normalizeScoring(scoring);
  if (mode === "simple") return scoreRoundSimple(questionId);
  return scoreRoundWeighted(questionId);
}

function scoreTotalsThrough(questionIndex, scoring) {
  const totals = {};
  state.game.players.forEach((p) => (totals[p.id] = 0));
  const lastIndex = Math.min(questionIndex, state.game.questions.length - 1);
  state.game.questions.slice(0, lastIndex + 1).forEach((question) => {
    const round = scoreRound(question.id, scoring);
    Object.entries(round).forEach(([playerId, points]) => {
      totals[playerId] += points;
    });
  });
  return totals;
}

function sortScores(scoreMap) {
  const rows = state.game.players.map((p) => ({ player: p, points: scoreMap[p.id] || 0 }));
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.player.name.localeCompare(b.player.name);
  });
  return rows;
}

function getPresenterForQuestion(question, index) {
  ensurePresenter(question, index);
  return state.game.players.find((player) => player.id === question.presenterId) || null;
}

function getPresenterRanking(questionId, presenterId) {
  if (!presenterId) return [];
  const submission = state.game.submissions[presenterId];
  if (!submission || !submission.byQuestion) return [];
  return submission.byQuestion[questionId] || [];
}

function getRevealMaxSteps(questionId) {
  if (!questionId) return 0;
  const consensusOrder = buildConsensusRanking(questionId);
  return consensusOrder.length * 2;
}

function renderReveal() {
  const question = state.game.questions[state.revealIndex] || { text: t("labels.noQuestions") };
  el.revealQuestionText.textContent = question.text || t("labels.untitledQuestion");
  const scoringMode = getScoringMode();
  const consensusOrder = question.id ? buildConsensusRanking(question.id) : [];
  const presenter = question.id ? getPresenterForQuestion(question, state.revealIndex) : null;
  const presenterRanking = question.id
    ? getPresenterRanking(question.id, presenter ? presenter.id : null)
    : [];
  const presenterName = presenter ? presenter.name : t("labels.presenterTbd");
  if (el.revealPresenterLine) {
    el.revealPresenterLine.textContent = t("reveal.promptLine", {
      presenter: presenterName,
    });
  }
  el.revealPresenterLabel.textContent = presenterName;
  const roundScores = question.id ? scoreRound(question.id, scoringMode) : {};
  const showTotals = state.revealIndex >= 1;
  const totalScores = showTotals ? scoreTotalsThrough(state.revealIndex, scoringMode) : {};
  const maxSteps = getRevealMaxSteps(question.id);
  if (state.revealStep > maxSteps) state.revealStep = maxSteps;
  renderRevealList(consensusOrder, presenterRanking, state.revealStep);
  renderLeaderboard(el.roundLeaderboard, roundScores);
  if (showTotals) {
    renderLeaderboard(el.totalLeaderboard, totalScores);
  } else {
    el.totalLeaderboard.innerHTML = "";
  }
  el.revealStage.classList.toggle("hidden", !state.revealFullscreenReady);
  el.revealPrompt.classList.toggle("hidden", state.revealPhase !== "prompt");
  el.revealQuestionPanel.classList.toggle("hidden", state.revealPhase !== "question");
  el.revealRankingPanel.classList.toggle("hidden", state.revealPhase !== "reveal");
  el.revealRoundScorePanel.classList.toggle("hidden", state.revealPhase !== "roundscore");
  el.revealTotalPanel.classList.toggle(
    "hidden",
    !showTotals || state.revealPhase !== "totals"
  );
  if (el.scoringSimple && el.scoringWeighted) {
    el.scoringSimple.checked = scoringMode === "simple";
    el.scoringWeighted.checked = scoringMode === "weighted";
  }
  if (el.roundScoreExplain) {
    el.roundScoreExplain.textContent =
      scoringMode === "simple" ? t("scoring.roundSimple") : t("scoring.roundWeighted");
  }
  if (el.totalScoreExplain) {
    el.totalScoreExplain.textContent =
      scoringMode === "simple" ? t("scoring.totalSimple") : t("scoring.totalWeighted");
  }
  el.revealPrev.disabled = state.revealIndex <= 0 && state.revealPhase === "prompt";
  el.revealNext.disabled =
    state.revealIndex >= state.game.questions.length - 1 && state.revealPhase === "totals";
}

function renderRevealList(consensusOrder, presenterOrder, revealStep) {
  el.roundReveal.innerHTML = "";
  const total = consensusOrder.length;
  const activeStep =
    state.revealPhase === "reveal" ||
    state.revealPhase === "roundscore" ||
    state.revealPhase === "totals"
      ? Math.min(revealStep, total * 2)
      : 0;
  consensusOrder.forEach((playerId, index) => {
    const place = index + 1;
    const presenterId = presenterOrder[index];
    const presenter = state.game.players.find((p) => p.id === presenterId);
    const consensus = state.game.players.find((p) => p.id === playerId);
    const presenterVisible = activeStep >= index * 2 + 1;
    const matchVisible = activeStep >= index * 2 + 2;
    const li = document.createElement("li");
    li.className = "reveal-row";
    const rank = document.createElement("span");
    rank.className = "reveal-rank";
    rank.textContent = `${place}.`;
    const picks = document.createElement("div");
    picks.className = "reveal-picks";
    const presenterRow = document.createElement("div");
    presenterRow.className = "reveal-pick";
    const presenterLabel = document.createElement("span");
    presenterLabel.className = "reveal-label";
    presenterLabel.textContent = t("labels.presenter");
    const presenterValue = document.createElement("span");
    presenterValue.className = "reveal-value";
    presenterValue.textContent = presenterVisible
      ? presenter
        ? presenter.name
        : t("labels.unknown")
      : "...";
    presenterRow.appendChild(presenterLabel);
    presenterRow.appendChild(presenterValue);
    const groupRow = document.createElement("div");
    groupRow.className = "reveal-pick";
    const groupLabel = document.createElement("span");
    groupLabel.className = "reveal-label";
    groupLabel.textContent = t("labels.groupAvg");
    const groupValue = document.createElement("span");
    groupValue.className = "reveal-value";
    groupValue.textContent = matchVisible
      ? consensus
        ? consensus.name
        : t("labels.unknown")
      : "...";
    groupRow.appendChild(groupLabel);
    groupRow.appendChild(groupValue);
    picks.appendChild(presenterRow);
    picks.appendChild(groupRow);
    const badge = document.createElement("span");
    badge.className = "reveal-badge";
    if (matchVisible) {
      const isMatch = presenterId && presenterId === playerId;
      li.classList.add(isMatch ? "match" : "miss");
      badge.textContent = isMatch ? t("labels.match") : t("labels.noMatch");
    } else {
      badge.textContent = "";
    }
    li.appendChild(rank);
    li.appendChild(picks);
    li.appendChild(badge);
    el.roundReveal.appendChild(li);
  });
}

function renderLeaderboard(node, scoreMap) {
  node.innerHTML = "";
  sortScores(scoreMap).forEach((row, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${row.player.name} (${row.points})`;
    node.appendChild(li);
  });
}

function validateSetup() {
  const names = state.game.players.map((p) => p.name.trim()).filter(Boolean);
  if (names.length < 2) return t("errors.addPlayers");
  if (new Set(names).size !== names.length) return t("errors.uniquePlayers");
  const questions = state.game.questions.map((q) => q.text.trim()).filter(Boolean);
  if (!questions.length) return t("errors.addQuestions");
  return null;
}

function handleSetupChange() {
  const error = validateSetup();
  if (error) showError(el.setupError, error);
  else hideError(el.setupError);
  saveGameLocal(state.game);
}

async function initFromHash() {
  const { view, g } = parseHash();
  if (g) {
    try {
      state.game = await decodeGame(g);
      saveGameLocal(state.game);
    } catch {
      state.game = loadGameLocal() || emptyGame();
    }
  } else {
    state.game = loadGameLocal() || emptyGame();
  }
  ensureSettings();
  normalizePresenters();
  setView(view || "setup");
  if (view === "reveal") {
    state.revealPhase = "prompt";
    state.revealStep = 0;
    state.revealFullscreenReady = false;
    el.revealFullscreen.classList.remove("hidden");
  }
  renderAll();
}

function renderAll() {
  el.gameTitle.value = state.game.title || "";
  el.gameTitle.disabled = Boolean(state.game.finalizedAt);
  renderPlayersList();
  renderQuestionsList();
  renderPlayerSelect();
  renderPlayerQuestion();
  renderSubmissionStatus();
  renderReveal();
  el.addPlayer.disabled = Boolean(state.game.finalizedAt);
  el.addQuestion.disabled = Boolean(state.game.finalizedAt);
  el.finalizeGame.disabled = Boolean(state.game.finalizedAt);
  el.finalizedPanel.classList.toggle("hidden", !state.game.finalizedAt);
  el.revealLinkPanel.classList.add("hidden");
  if (state.game.finalizedAt) {
    if (!state.shareEncoded) syncHashFromGame(state.game);
    el.gameCode.value = state.shareEncoded;
  }
  renderPlayerStep();
}

el.navSetup.addEventListener("click", () => setView("setup"));
el.navHost.addEventListener("click", () => setView("host"));
if (el.languageSelect) {
  el.languageSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });
}

el.gameTitle.addEventListener("input", () => {
  state.game.title = el.gameTitle.value;
  handleSetupChange();
});

el.addPlayer.addEventListener("click", () => {
  state.game.players.push({ id: createId("p"), name: "" });
  handleSetupChange();
  renderPlayersList();
  renderPlayerSelect();
});

el.addQuestion.addEventListener("click", () => {
  const index = state.game.questions.length;
  state.game.questions.push({
    id: createId("q"),
    text: "",
    presenterId: getDefaultPresenterId(index),
  });
  handleSetupChange();
  renderQuestionsList();
  renderPlayerQuestion();
});

el.finalizeGame.addEventListener("click", async () => {
  const error = validateSetup();
  if (error) {
    showError(el.setupError, error);
    return;
  }
  state.game.finalizedAt = new Date().toISOString();
  saveGameLocal(state.game);
  await syncHashFromGame(state.game, "setup");
  renderAll();
});

el.copyShare.addEventListener("click", async () => {
  if (!state.game.finalizedAt) return;
  await syncHashFromGame(state.game);
  el.shareUrl.select();
  document.execCommand("copy");
});

el.goHost.addEventListener("click", async () => {
  setView("host");
});

el.playerSelect.addEventListener("change", () => {
  state.playerForm.playerId = el.playerSelect.value || null;
  state.playerForm.markedSubmitted = false;
  state.playerForm.visibleCount = 1;
  updatePlayerNav();
  el.playerConfirm.disabled = !state.playerForm.playerId;
});

el.playerConfirm.addEventListener("click", () => {
  if (!state.playerForm.playerId) return;
  state.playerForm.step = "questions";
  renderPlayerQuestion();
  renderPlayerStep();
});

el.nextQuestion.addEventListener("click", () => {
  state.playerForm.visibleCount = Math.min(
    state.game.questions.length,
    state.playerForm.visibleCount + 1
  );
  renderPlayerQuestion();
});

el.playerFinish.addEventListener("click", async () => {
  if (!canExportSubmission()) {
    showError(el.playerError, t("errors.completeQuestions"));
    return;
  }
  hideError(el.playerError);
  await refreshSubmissionLine();
  state.playerForm.step = "submit";
  renderPlayerStep();
});

el.copySubmissionLine.addEventListener("click", () => {
  el.submissionLine.select();
  document.execCommand("copy");
  state.playerForm.markedSubmitted = true;
  updatePlayerNav();
  renderPlayerQuestion();
});

el.importSubmit.addEventListener("click", async () => {
  hideError(el.importError);
  const text = el.importText.value.trim();
  if (!text) return;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const sepIndex = line.indexOf(":");
    if (sepIndex <= 0) {
      showError(el.importError, t("errors.lineFormat"));
      continue;
    }
    const name = line.slice(0, sepIndex).trim();
    const payload = line.slice(sepIndex + 1).trim();
    const player = state.game.players.find((p) => p.name === name);
    if (!player) {
      showError(el.importError, t("errors.unknownPlayer", { name }));
      continue;
    }
    try {
      const submission = await decodePayload(payload);
      if (submission.gameId !== state.game.gameId) {
        showError(el.importError, t("errors.gameMismatch", { name }));
        continue;
      }
      if (submission.playerId !== player.id) {
        showError(el.importError, t("errors.playerMismatch", { name }));
        continue;
      }
      if (state.game.submissions[player.id]) {
        showError(el.importError, t("errors.duplicateSubmission", { name }));
        continue;
      }
      state.game.submissions[player.id] = submission;
      saveGameLocal(state.game);
    } catch {
      showError(el.importError, t("errors.invalidPayload", { name }));
    }
  }
  renderSubmissionStatus();
});

el.startReveal.addEventListener("click", async () => {
  if (!allSubmissionsIn()) return;
  const revealLink = await generateRevealLink();
  if (!revealLink) return;
  el.revealLinkPanel.classList.remove("hidden");
  renderQr(el.revealQr, revealLink);
});

el.copyReveal.addEventListener("click", () => {
  el.revealUrl.select();
  document.execCommand("copy");
});

el.openReveal.addEventListener("click", () => {
  if (!el.revealUrl.value) return;
  location.href = el.revealUrl.value;
});

el.revealPrev.addEventListener("click", () => {
  if (!state.revealFullscreenReady) return;
  if (state.revealPhase === "prompt") {
    if (state.revealIndex > 0) {
      state.revealIndex -= 1;
      state.revealPhase = state.revealIndex >= 1 ? "totals" : "roundscore";
      state.revealStep = currentRevealMaxSteps();
    }
  } else if (state.revealPhase === "question") {
    state.revealPhase = "prompt";
  } else if (state.revealPhase === "reveal") {
    if (state.revealStep > 1) {
      state.revealStep -= 1;
    } else {
      state.revealPhase = "question";
    }
  } else if (state.revealPhase === "roundscore") {
    state.revealPhase = "reveal";
    state.revealStep = currentRevealMaxSteps();
  } else if (state.revealPhase === "totals") {
    state.revealPhase = "roundscore";
  }
  renderReveal();
});

el.revealNext.addEventListener("click", () => {
  if (!state.revealFullscreenReady) return;
  const maxSteps = currentRevealMaxSteps();
  if (state.revealPhase === "prompt") {
    state.revealPhase = "question";
  } else if (state.revealPhase === "question") {
    state.revealPhase = "reveal";
    state.revealStep = 1;
  } else if (state.revealPhase === "reveal") {
    if (state.revealStep < maxSteps) {
      state.revealStep += 1;
    } else {
      state.revealPhase = "roundscore";
    }
  } else if (state.revealPhase === "roundscore") {
    if (state.revealIndex >= 1) {
      state.revealPhase = "totals";
    } else if (state.revealIndex < state.game.questions.length - 1) {
      state.revealIndex += 1;
      state.revealPhase = "prompt";
      state.revealStep = 0;
    }
  } else if (state.revealPhase === "totals") {
    if (state.revealIndex < state.game.questions.length - 1) {
      state.revealIndex += 1;
      state.revealPhase = "prompt";
      state.revealStep = 0;
    }
  }
  renderReveal();
});

el.revealEnterFullscreen.addEventListener("click", async () => {
  if (document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen();
  }
  state.revealFullscreenReady = true;
  el.revealFullscreen.classList.add("hidden");
  renderReveal();
});

el.revealSkipFullscreen.addEventListener("click", () => {
  state.revealFullscreenReady = true;
  el.revealFullscreen.classList.add("hidden");
  renderReveal();
});

if (el.scoringSimple) {
  el.scoringSimple.addEventListener("change", (event) => {
    if (!event.target.checked) return;
    setScoringMode(event.target.value);
    renderReveal();
  });
}

if (el.scoringWeighted) {
  el.scoringWeighted.addEventListener("change", (event) => {
    if (!event.target.checked) return;
    setScoringMode(event.target.value);
    renderReveal();
  });
}

async function generateRevealLink() {
  const base = location.href.split("#")[0];
  const params = new URLSearchParams();
  params.set("v", "reveal");
  const encoded = await encodeFullGame(state.game);
  params.set(HASH_PREFIX, encoded);
  const url = `${base}#${params.toString()}`;
  el.revealUrl.value = url;
  return url;
}

async function encodeFullGame(game) {
  const json = JSON.stringify(game);
  const compressed = await deflateRaw(utf8ToBytes(json));
  return bytesToBase64url(compressed);
}

function renderQr(canvas, text) {
  if (!canvas) return;
  QRCode.toCanvas(canvas, text, { width: 220, margin: 1 }, () => {});
}

function currentRevealMaxSteps() {
  const question = state.game.questions[state.revealIndex];
  return question ? getRevealMaxSteps(question.id) : 0;
}

window.addEventListener("hashchange", initFromHash);

(async () => {
  state.language = getInitialLanguage();
  renderLanguageOptions();
  applyTranslations();
  ensureGame();
  await initFromHash();
})();
