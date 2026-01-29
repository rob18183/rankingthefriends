## Ranking Your Friends - UI Wireflow + Component List

### 1) High-level navigation
- **Home / Setup** (host)
- **Player Flow** (player)
- **Collect Codes** (host)
- **Reveal / Presentation** (host via Game Night link)

### 2) Wireflow (step-by-step)
#### 2.1 Home / Setup
1. **Game title** input.
2. **Players list**: add/remove player names (no duplicates).
3. **Questions list**: add/remove questions (any count).
4. **Lock game**: freezes setup, generates share link.
5. **Share link**: read-only URL with hash.
6. **Go to Collect Codes**.

#### 2.2 Player Flow
1. **Name select** (dropdown of players) → confirm.
2. **Questions** stack downward:
   - Prompt text per question.
   - **Rank list** (drag-and-drop + up/down buttons).
   - "Next question" adds the next card.
3. **Finish** → shows **secret code** to copy and send.

#### 2.3 Collect Codes
1. **Paste panel**: multiline `name:code` input.
2. **Submission status**: checklist of players (submitted / missing).
3. **Generate Game Night link**: enabled when all submissions in.
4. **QR code**: shareable for opening on the big screen.

#### 2.4 Reveal / Presentation
1. **Fullscreen prompt**.
2. **Presenter prompt**.
3. **Question** (large).
4. **Ranking reveal** (last → first).
5. **Round score**.
6. **Total score**.

### 3) Key UI components (minimal)
- **GameTitleInput**
- **PlayersEditor** (list + add/remove)
- **QuestionsEditor** (list + add/remove)
- **ShareLinkBox** (copy button)
- **PlayerSelect**
- **QuestionCard**
- **RankList** (drag-and-drop + up/down)
- **ProgressTracker**
- **SecretCodeBox**
- **PasteCodesPanel**
- **SubmissionStatusList**
- **RevealSlide**
- **LeaderboardTable**
- **RevealControls**
- **FullscreenToggle**

### 4) Validation UX (surface-level)
- Inline errors for:
  - Duplicate player names.
  - Empty player or question list.
  - Incomplete ranking (missing player).
- Blocking modal on bad import (wrong gameId, duplicates, invalid payload).

### 5) State ownership (where data lives)
- **Home/Setup** owns game setup state.
- **Player Flow** reads game setup from URL hash; writes only player submission.
- **Collect Codes** reads setup from hash/localStorage; merges submissions.
