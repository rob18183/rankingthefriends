import QRCode from "qrcode";

const STORAGE_KEY = "ryf:game";
const HASH_PREFIX = "g";

const state = {
  view: "setup",
  game: null,
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
  revealQuestionPanel: document.getElementById("reveal-question-panel"),
  revealQuestionText: document.getElementById("reveal-question-text"),
  revealRankingPanel: document.getElementById("reveal-ranking-panel"),
  revealRoundScorePanel: document.getElementById("reveal-roundscore-panel"),
  revealTotalPanel: document.getElementById("reveal-total-panel"),
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
    settings: { scoring: "descending", reveal: "rounds" },
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
    showError(el.setupError, "Share link is too long. Reduce players or questions.");
    return "";
  }
  if (encoded.length > 8000) {
    showError(el.setupError, "Share link is getting long. Consider fewer questions.");
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
    });
    input.disabled = Boolean(state.game.finalizedAt);
    const remove = document.createElement("button");
    remove.className = "btn";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      if (state.game.finalizedAt) return;
      state.game.players = state.game.players.filter((p) => p.id !== player.id);
      saveGameLocal(state.game);
      renderPlayersList();
      renderPlayerSelect();
    });
    remove.disabled = Boolean(state.game.finalizedAt);
    row.appendChild(input);
    row.appendChild(remove);
    el.playersList.appendChild(row);
  });
}

function renderQuestionsList() {
  el.questionsList.innerHTML = "";
  state.game.questions.forEach((question) => {
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
    const remove = document.createElement("button");
    remove.className = "btn";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      if (state.game.finalizedAt) return;
      state.game.questions = state.game.questions.filter((q) => q.id !== question.id);
      saveGameLocal(state.game);
      renderQuestionsList();
      renderPlayerQuestion();
    });
    remove.disabled = Boolean(state.game.finalizedAt);
    row.appendChild(input);
    row.appendChild(remove);
    el.questionsList.appendChild(row);
  });
}

function renderPlayerSelect() {
  el.playerSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select...";
  el.playerSelect.appendChild(placeholder);
  state.game.players.forEach((player) => {
    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.name || "(unnamed)";
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
    title.textContent = `${index + 1}. ${question.text || "Untitled question"}`;
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
      nameSpan.textContent = `${position + 1}. ${player ? player.name : "Unknown"}`;
      const dragSpan = document.createElement("span");
      dragSpan.textContent = "Drag";
      const controls = document.createElement("div");
      controls.className = "rank-controls";
      const up = document.createElement("button");
      up.className = "rank-btn";
      up.type = "button";
      up.textContent = "Up";
      up.disabled = position === 0 || state.playerForm.markedSubmitted;
      up.addEventListener("click", () => moveRanking(question.id, playerId, -1));
      const down = document.createElement("button");
      down.className = "rank-btn";
      down.type = "button";
      down.textContent = "Down";
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
    row.textContent = `${player.name || "Unnamed"} - ${state.game.submissions[player.id] ? "Submitted" : "Missing"}`;
    el.submissionStatus.appendChild(row);
  });
  el.startReveal.disabled = !allSubmissionsIn();
}

function allSubmissionsIn() {
  return state.game.players.length > 0 && state.game.players.every((p) => state.game.submissions[p.id]);
}

function buildConsensusScores(questionId) {
  const totals = {};
  state.game.players.forEach((p) => (totals[p.id] = 0));
  Object.values(state.game.submissions).forEach((submission) => {
    const ranking = submission.byQuestion[questionId];
    if (!ranking) return;
    ranking.forEach((playerId, index) => {
      totals[playerId] += state.game.players.length - index;
    });
  });
  return totals;
}

function maxRankDistance(playerCount) {
  let total = 0;
  for (let i = 0; i < playerCount; i += 1) {
    total += Math.abs(i - (playerCount - 1 - i));
  }
  return total;
}

function scoreRound(questionId) {
  const totals = {};
  state.game.players.forEach((p) => (totals[p.id] = 0));
  const consensusScores = buildConsensusScores(questionId);
  const consensusOrder = sortScores(consensusScores).map((row) => row.player.id);
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

function scoreTotals() {
  const totals = {};
  state.game.players.forEach((p) => (totals[p.id] = 0));
  state.game.questions.forEach((question) => {
    const round = scoreRound(question.id);
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

function renderReveal() {
  const question = state.game.questions[state.revealIndex] || { text: "No questions" };
  el.revealQuestionText.textContent = question.text || "Untitled question";
  const consensusScores = question.id ? buildConsensusScores(question.id) : {};
  const consensusOrder = sortScores(consensusScores).map((row) => row.player.id);
  const roundScores = question.id ? scoreRound(question.id) : {};
  const totalScores = scoreTotals();
  renderRevealList(consensusOrder);
  renderLeaderboard(el.roundLeaderboard, roundScores);
  renderLeaderboard(el.totalLeaderboard, totalScores);
  el.revealStage.classList.toggle("hidden", !state.revealFullscreenReady);
  el.revealPrompt.classList.toggle("hidden", state.revealPhase !== "prompt");
  el.revealQuestionPanel.classList.toggle("hidden", state.revealPhase !== "question");
  el.revealRankingPanel.classList.toggle("hidden", state.revealPhase !== "reveal");
  el.revealRoundScorePanel.classList.toggle("hidden", state.revealPhase !== "roundscore");
  el.revealTotalPanel.classList.toggle("hidden", state.revealPhase !== "totals");
  el.revealPrev.disabled = state.revealIndex <= 0 && state.revealPhase === "prompt";
  el.revealNext.disabled =
    state.revealIndex >= state.game.questions.length - 1 && state.revealPhase === "totals";
}

function renderRevealList(ranking) {
  el.roundReveal.innerHTML = "";
  const total = ranking.length;
  const revealCount =
    state.revealPhase === "reveal" ||
    state.revealPhase === "roundscore" ||
    state.revealPhase === "totals"
      ? Math.min(state.revealStep, total)
      : 0;
  ranking.forEach((playerId, index) => {
    const player = state.game.players.find((p) => p.id === playerId);
    const place = index + 1;
    const li = document.createElement("li");
    const revealFromBottom = index >= total - revealCount;
    if (revealFromBottom) {
      li.textContent = `${place}. ${player ? player.name : "Unknown"}`;
    } else {
      li.textContent = `${place}. ...`;
    }
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
  if (names.length < 2) return "Add at least two players.";
  if (new Set(names).size !== names.length) return "Player names must be unique.";
  const questions = state.game.questions.map((q) => q.text.trim()).filter(Boolean);
  if (!questions.length) return "Add at least one question.";
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
el.navReveal.addEventListener("click", () => setView("reveal"));

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
  state.game.questions.push({ id: createId("q"), text: "" });
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
    showError(el.playerError, "Complete all questions before finishing.");
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
      showError(el.importError, "Each line must be name:code.");
      continue;
    }
    const name = line.slice(0, sepIndex).trim();
    const payload = line.slice(sepIndex + 1).trim();
    const player = state.game.players.find((p) => p.name === name);
    if (!player) {
      showError(el.importError, `Unknown player name: ${name}`);
      continue;
    }
    try {
      const submission = await decodePayload(payload);
      if (submission.gameId !== state.game.gameId) {
        showError(el.importError, `Game mismatch for ${name}.`);
        continue;
      }
      if (submission.playerId !== player.id) {
        showError(el.importError, `Player mismatch for ${name}.`);
        continue;
      }
      if (state.game.submissions[player.id]) {
        showError(el.importError, `Duplicate submission for ${name}.`);
        continue;
      }
      state.game.submissions[player.id] = submission;
      saveGameLocal(state.game);
    } catch {
      showError(el.importError, `Invalid payload for ${name}.`);
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
      state.revealPhase = "totals";
      state.revealStep = state.game.players.length;
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
  } else if (state.revealPhase === "totals") {
    state.revealPhase = "roundscore";
  }
  renderReveal();
});

el.revealNext.addEventListener("click", () => {
  if (!state.revealFullscreenReady) return;
  if (state.revealPhase === "prompt") {
    state.revealPhase = "question";
  } else if (state.revealPhase === "question") {
    state.revealPhase = "reveal";
    state.revealStep = 1;
  } else if (state.revealPhase === "reveal") {
    if (state.revealStep < state.game.players.length) {
      state.revealStep += 1;
    } else {
      state.revealPhase = "roundscore";
    }
  } else if (state.revealPhase === "roundscore") {
    state.revealPhase = "totals";
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

window.addEventListener("hashchange", initFromHash);

(async () => {
  ensureGame();
  await initFromHash();
})();
