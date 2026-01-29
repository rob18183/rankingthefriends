## Ranking Your Friends - Component Props & State

### 1) Types (shared)
```
Player = { id: string, name: string }
Question = { id: string, text: string }
Ranking = string[] // ordered list of player ids

Submission = {
  gameId: string,
  playerId: string,
  byQuestion: Record<questionId, Ranking>
}

GameState = {
  gameId: string,
  title: string,
  players: Player[],
  questions: Question[],
  submissions: Record<playerId, Submission>
}
```

### 2) Components
#### GameTitleInput
- Props: `title`, `onChange`
- State: none

#### PlayersEditor
- Props: `players`, `onAdd`, `onRemove`, `onUpdateName`
- State: none

#### QuestionsEditor
- Props: `questions`, `onAdd`, `onRemove`, `onUpdateText`
- State: none

#### ShareLinkBox
- Props: `url`, `onCopy`, `onOpenPlayerView`
- State: none

#### PlayerSelect
- Props: `players`, `selectedId`, `onSelect`
- State: none

#### PlayerStepRouter
- Props: `step` ("identity" | "questions" | "submit"), `onStepChange`
- State: none

#### RankList
- Props: `players`, `ranking`, `onChange`, `onMoveUp`, `onMoveDown`
- State: internal drag state only

#### QuestionCard
- Props: `question`, `ranking`, `players`, `onRankingChange`
- State: none

#### ProgressTracker
- Props: `currentIndex`, `total`, `completedCount`
- State: none

#### SecretCodeBox
- Props: `code`, `onCopy`
- State: none

#### PasteCodesPanel
- Props: `onImport`, `lastError`
- State: none

#### SubmissionStatusList
- Props: `players`, `submittedIds`
- State: none

- Props: `question`, `phase`, `roundScores`, `totalScores`, `revealCount`
- State: none

#### LeaderboardTable
- Props: `scores` (array of `{ playerId, points, rank }`)
- State: none

#### RevealControls
- Props: `canPrev`, `canNext`, `onPrev`, `onNext`, `showTotals`, `onToggleTotals`
- State: none

#### FullscreenToggle
- Props: `isFullscreen`, `onToggle`
- State: none

### 3) Screen-level state
#### Setup Screen
- Owns `GameState` (without submissions).
- Writes URL-hash + localStorage on changes.

#### Player Flow
- Reads `GameState` from URL-hash.
- Owns `SubmissionDraft` (playerId + byQuestion).

#### Collect Codes
- Reads `GameState` from URL-hash/localStorage.
- Merges imported `Submission`s into `submissions`.

#### Reveal Screen
- Reads `GameState` + derived scores.
- Owns current round index.
