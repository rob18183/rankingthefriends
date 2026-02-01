import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addPlayer,
  addQuestion,
  advanceReveal,
  buildConsensusRanking,
  getRevealMaxSteps,
  moveRanking,
  rewindReveal,
  scoreRound,
  scoreTotalsThrough,
} from "../game-logic.ts";

const baseGame = () => ({
  players: [],
  questions: [],
  submissions: {},
});

describe("game logic", () => {
  it("adds players and questions to the game", () => {
    let game = baseGame();
    game = addPlayer(game, { id: "p1", name: "Alice" });
    game = addPlayer(game, { id: "p2", name: "Bob" });
    game = addQuestion(game, { id: "q1", text: "Question 1", presenterId: "p1" });

    assert.equal(game.players.length, 2);
    assert.equal(game.questions.length, 1);
    assert.equal(game.players[0].name, "Alice");
    assert.equal(game.questions[0].text, "Question 1");
  });

  it("reorders rankings in response to up/down moves", () => {
    const ranking = ["p1", "p2", "p3"];
    const moved = moveRanking(ranking, "p1", 1);
    assert.deepEqual(moved, ["p2", "p1", "p3"]);
    const unchanged = moveRanking(ranking, "missing", 1);
    assert.deepEqual(unchanged, ranking);
  });

  it("scores rounds and totals from submissions", () => {
    const game = {
      players: [
        { id: "p1", name: "Alice" },
        { id: "p2", name: "Bob" },
        { id: "p3", name: "Casey" },
      ],
      questions: [
        { id: "q1", text: "Question 1", presenterId: "p1" },
        { id: "q2", text: "Question 2", presenterId: "p2" },
      ],
      submissions: {
        p1: { playerId: "p1", byQuestion: { q1: ["p1", "p2", "p3"], q2: ["p2", "p1", "p3"] } },
        p2: { playerId: "p2", byQuestion: { q1: ["p2", "p1", "p3"], q2: ["p1", "p2", "p3"] } },
        p3: { playerId: "p3", byQuestion: { q1: ["p1", "p3", "p2"], q2: ["p1", "p3", "p2"] } },
      },
    };

    const consensus = buildConsensusRanking(game, "q1");
    assert.deepEqual(consensus, ["p1", "p2", "p3"]);

    const simple = scoreRound(game, "q1", "simple");
    assert.deepEqual(simple, { p1: 3, p2: 1, p3: 1 });

    const weighted = scoreRound(game, "q1", "weighted");
    assert.deepEqual(weighted, { p1: 4, p2: 2, p3: 2 });

    const totals = scoreTotalsThrough(game, 1, "simple");
    assert.equal(totals.p1 > 0, true);
    assert.equal(Object.keys(totals).length, 3);
  });

  it("advances and rewinds through the reveal sequence", () => {
    const game = {
      players: [
        { id: "p1", name: "Alice" },
        { id: "p2", name: "Bob" },
      ],
      questions: [
        { id: "q1", text: "Question 1", presenterId: "p1" },
        { id: "q2", text: "Question 2", presenterId: "p2" },
      ],
      submissions: {
        p1: { playerId: "p1", byQuestion: { q1: ["p1", "p2"], q2: ["p2", "p1"] } },
        p2: { playerId: "p2", byQuestion: { q1: ["p2", "p1"], q2: ["p1", "p2"] } },
      },
    };
    const maxSteps = getRevealMaxSteps(game, "q1");
    assert.equal(maxSteps, 4);

    let reveal = { revealPhase: "prompt", revealIndex: 0, revealStep: 0 };
    reveal = advanceReveal(reveal, game);
    assert.equal(reveal.revealPhase, "question");
    reveal = advanceReveal(reveal, game);
    assert.equal(reveal.revealPhase, "reveal");
    reveal = advanceReveal(reveal, game);
    assert.equal(reveal.revealStep, 2);
    reveal = rewindReveal(reveal, game);
    assert.equal(reveal.revealStep, 1);
  });
});
