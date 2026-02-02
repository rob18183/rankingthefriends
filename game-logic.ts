export type ScoringMode = "simple" | "weighted" | "descending";

export type NormalizedScoringMode = "simple" | "weighted";

export type RevealPhase = "prompt" | "question" | "reveal" | "roundscore" | "totals" | "end";

export type RevealState = {
  revealPhase: RevealPhase;
  revealIndex: number;
  revealStep: number;
};

export type LocalizedText = Record<string, string>;

export type Player = {
  id: string;
  name: string;
};

export type Question = {
  id: string;
  text: string | LocalizedText;
  presenterId: string | null;
  category?: string;
};

export type Submission = {
  version?: number;
  gameId?: string;
  submittedAt?: string;
  playerId: string;
  byQuestion: Record<string, string[]>;
};

export type GameSettings = {
  scoring: ScoringMode;
  reveal?: "rounds";
};

export type Game = {
  version?: number;
  gameId?: string;
  title?: string;
  createdAt?: string;
  finalizedAt?: string | null;
  players: Player[];
  questions: Question[];
  submissions: Record<string, Submission>;
  settings?: GameSettings;
};

export function addPlayer(game: Game, player: Player): Game {
  return { ...game, players: [...game.players, player] };
}

export function addQuestion(game: Game, question: Question): Game {
  return { ...game, questions: [...game.questions, question] };
}

export function moveRanking(ranking: string[], playerId: string, delta: number): string[] {
  const from = ranking.indexOf(playerId);
  if (from === -1) return ranking;
  const to = Math.max(0, Math.min(ranking.length - 1, from + delta));
  if (from === to) return ranking;
  const next = [...ranking];
  next.splice(from, 1);
  next.splice(to, 0, playerId);
  return next;
}

export function buildConsensusRanking(game: Game, questionId: string): string[] {
  const totals: Record<string, number> = {};
  const counts: Record<string, number> = {};
  game.players.forEach((p) => {
    totals[p.id] = 0;
    counts[p.id] = 0;
  });
  Object.values(game.submissions).forEach((submission) => {
    const ranking = submission.byQuestion[questionId];
    if (!ranking) return;
    ranking.forEach((playerId, index) => {
      totals[playerId] += index;
      counts[playerId] += 1;
    });
  });
  const ranked = game.players.map((player) => {
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

export function maxRankDistance(playerCount: number): number {
  let total = 0;
  for (let i = 0; i < playerCount; i += 1) {
    total += Math.abs(i - (playerCount - 1 - i));
  }
  return total;
}

export function normalizeScoring(scoring?: string | null): NormalizedScoringMode {
  if (scoring === "descending") return "weighted";
  if (scoring === "simple" || scoring === "weighted") return scoring;
  return "weighted";
}

export function scoreRoundWeighted(game: Game, questionId: string): Record<string, number> {
  const totals: Record<string, number> = {};
  game.players.forEach((p) => (totals[p.id] = 0));
  const consensusOrder = buildConsensusRanking(game, questionId);
  if (!consensusOrder.length) return totals;
  const consensusPositions = new Map<string, number>();
  consensusOrder.forEach((playerId, index) => {
    consensusPositions.set(playerId, index);
  });
  const maxDistance = maxRankDistance(game.players.length);
  Object.values(game.submissions).forEach((submission) => {
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

export function scoreRoundSimple(game: Game, questionId: string): Record<string, number> {
  const totals: Record<string, number> = {};
  game.players.forEach((p) => (totals[p.id] = 0));
  const consensusOrder = buildConsensusRanking(game, questionId);
  if (!consensusOrder.length) return totals;
  const consensusPositions = new Map<string, number>();
  consensusOrder.forEach((playerId, index) => {
    consensusPositions.set(playerId, index);
  });
  Object.values(game.submissions).forEach((submission) => {
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

export function scoreRound(game: Game, questionId: string, scoring?: string | null): Record<string, number> {
  const mode = normalizeScoring(scoring);
  if (mode === "simple") return scoreRoundSimple(game, questionId);
  return scoreRoundWeighted(game, questionId);
}

export function scoreTotalsThrough(
  game: Game,
  questionIndex: number,
  scoring?: string | null,
): Record<string, number> {
  const totals: Record<string, number> = {};
  game.players.forEach((p) => (totals[p.id] = 0));
  const lastIndex = Math.min(questionIndex, game.questions.length - 1);
  game.questions.slice(0, lastIndex + 1).forEach((question) => {
    const round = scoreRound(game, question.id, scoring);
    Object.entries(round).forEach(([playerId, points]) => {
      totals[playerId] += points;
    });
  });
  return totals;
}

export function sortScores(
  game: Game,
  scoreMap: Record<string, number>,
): Array<{ player: Player; points: number }> {
  const rows = game.players.map((p) => ({ player: p, points: scoreMap[p.id] || 0 }));
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.player.name.localeCompare(b.player.name);
  });
  return rows;
}

export function getRevealMaxSteps(game: Game, questionId: string | null): number {
  if (!questionId) return 0;
  const consensusOrder = buildConsensusRanking(game, questionId);
  return consensusOrder.length * 2;
}

export function advanceReveal(state: RevealState, game: Game): RevealState {
  const next = { ...state };
  const question = game.questions[next.revealIndex];
  const maxSteps = question ? getRevealMaxSteps(game, question.id) : 0;
  if (next.revealPhase === "prompt") {
    next.revealPhase = "question";
  } else if (next.revealPhase === "question") {
    next.revealPhase = "reveal";
    next.revealStep = 1;
  } else if (next.revealPhase === "reveal") {
    if (next.revealStep < maxSteps) {
      next.revealStep += 1;
    } else {
      next.revealPhase = "roundscore";
    }
  } else if (next.revealPhase === "roundscore") {
    if (next.revealIndex >= 1) {
      next.revealPhase = "totals";
    } else if (next.revealIndex < game.questions.length - 1) {
      next.revealIndex += 1;
      next.revealPhase = "prompt";
      next.revealStep = 0;
    } else {
      next.revealPhase = "end";
    }
  } else if (next.revealPhase === "totals") {
    if (next.revealIndex < game.questions.length - 1) {
      next.revealIndex += 1;
      next.revealPhase = "prompt";
      next.revealStep = 0;
    } else {
      next.revealPhase = "end";
    }
  } else if (next.revealPhase === "end") {
    next.revealPhase = "end";
  }
  return next;
}

export function rewindReveal(state: RevealState, game: Game): RevealState {
  const next = { ...state };
  if (next.revealPhase === "prompt") {
    if (next.revealIndex > 0) {
      next.revealIndex -= 1;
      next.revealPhase = next.revealIndex >= 1 ? "totals" : "roundscore";
      const previousQuestion = game.questions[next.revealIndex];
      next.revealStep = previousQuestion ? getRevealMaxSteps(game, previousQuestion.id) : 0;
    }
  } else if (next.revealPhase === "question") {
    next.revealPhase = "prompt";
  } else if (next.revealPhase === "reveal") {
    if (next.revealStep > 0) {
      next.revealStep -= 1;
    } else {
      next.revealPhase = "question";
    }
  } else if (next.revealPhase === "roundscore") {
    next.revealPhase = "reveal";
    const currentQuestion = game.questions[next.revealIndex];
    next.revealStep = currentQuestion ? getRevealMaxSteps(game, currentQuestion.id) : 0;
  } else if (next.revealPhase === "totals") {
    next.revealPhase = "roundscore";
  } else if (next.revealPhase === "end") {
    next.revealPhase = next.revealIndex >= 1 ? "totals" : "roundscore";
  }
  return next;
}
