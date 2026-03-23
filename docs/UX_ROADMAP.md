# UX Roadmap

## Goal
- Make the app self-explanatory for first-time hosts and players.
- Preserve the no-backend / share-link USP.
- Reduce the amount of social explanation the host has to do manually.

## Current UX diagnosis

### What is working
- The app has a clear visual identity and does not feel generic.
- The no-login model is appealing and lightweight.
- The core game loop is coherent once a user already understands it.
- The reveal flow has personality and feels like a payoff moment.

### What is not self-explanatory yet
1. The app assumes users already understand the whole game model.
   - The landing screen explains the concept in prose, but it does not actively guide a new host into the next step.
   - There is no strong “Start here” moment.

2. The role model is implicit.
   - The navigation only shows `Setup`, `Collect Codes`, and `Inspiration`.
   - The player role is not represented in the main navigation, even though it is the central second step of the product.
   - A host has to infer that “player link” creates a separate private player experience.

3. The terminology is too dense and slightly inconsistent.
   - The app uses several nouns close together:
   - lock game
   - share link
   - game code
   - player code
   - game night link
   - QR code
   - These are understandable individually, but together they make the system feel more complicated than it is.

4. The setup screen asks users to make decisions before they understand the payoff.
   - Scoring mode appears early and takes a lot of space.
   - Suggested questions, manual setup, scoring, lock state, and sharing are all presented with similar visual weight.
   - There is no “minimum viable setup” path.

5. The host collection flow still feels operational rather than guided.
   - Pasting codes into a big textarea is functional, but it feels technical.
   - The app does not coach the host about what players are sending, what “done” looks like, or what happens next.

6. The player flow is clearer than before, but it still requires trust.
   - A player has to understand why they are selecting their name, why they are ranking everyone, and why the output is a code.
   - The current copy tells them what to do, but not enough of why it works.

7. The app does not expose a simple end-to-end story.
   - A first-time user should be able to answer:
   - what am I doing now?
   - what happens next?
   - who else has to do something?
   - At the moment, those answers are distributed across several sections and rely on inference.

## Main UX problems by surface

### 1. Landing / home
- Problem: the page opens with flavor copy, a demo card, language selector, and navigation, but no dominant “host starts here” action.
- Risk: new users browse instead of progressing.
- Recommendation:
- Add a compact “How it works” strip with 3 steps and one primary CTA: `Start a new game`.
- Demote the demo reveal so it helps exploration without competing with the main path.

### 2. Setup
- Problem: setup currently behaves like a tool panel, not a guided wizard.
- Risk: the host has to learn the product structure while entering data.
- Recommendation:
- Reorder the setup screen around the real task order:
- add players
- add questions
- choose scoring
- create player link
- Add completion states like `2/4 setup steps done`.
- Collapse scoring details by default behind a short explanation.

### 3. Player handoff
- Problem: the handoff from host to player is mechanically correct but socially awkward.
- Risk: the host still has to explain what link to send and what the player should return.
- Recommendation:
- After finalizing, show a host checklist:
- `1. Send this player link`
- `2. Each friend ranks everyone`
- `3. Each friend sends back one player code`
- Rename the backup `game code` field to something more explicit if it remains exposed.

### 4. Player experience
- Problem: the player sees the mechanics, but the purpose is still a bit abstract.
- Risk: hesitation, especially around the secret code output.
- Recommendation:
- Add a short “what happens here” line:
- `You rank everyone privately. The app gives you one code to send back to the host.`
- Reinforce that names are fixed and private ranking only reorders existing people.
- Keep progress highly visible through the whole ranking flow.

### 5. Host collection
- Problem: `Paste codes` is efficient, but it feels like an admin task.
- Risk: hosts perceive the app as clever but cumbersome.
- Recommendation:
- Reframe this screen as a checklist, not just a textarea.
- Keep the textarea, but add a clearer explanation and a visual “waiting on / received” model.
- Consider one-code-at-a-time import as a secondary input mode later.

### 6. Reveal handoff
- Problem: the host creates a reveal link only after collection, but the app does not strongly frame this as the final presentation mode.
- Risk: users do not realize they are switching from facilitator mode to big-screen mode.
- Recommendation:
- Rephrase the action around outcome:
- `Open big-screen reveal`
- Add one sentence that explains the reveal is a separate presentation screen.

## Recommended UX principles

1. One noun per concept.
   - Example direction:
   - `Player link`: what the host sends to players
   - `Player code`: what a player sends back
   - `Reveal link`: what the host opens on the big screen

2. One primary action per screen.
   - Every major surface should have one clearly dominant next step.

3. Explain the next social handoff explicitly.
   - This app is not just UI navigation; it is coordination between people.

4. Progressive disclosure over simultaneous explanation.
   - Show only what is needed for the current step.
   - Keep advanced details available but not equally loud.

5. Use checklists and completion states.
   - Users should feel where they are in the party workflow, not just in the page structure.

## UX roadmap

## Phase 1: clarity and terminology
- Goal: make the current app understandable without changing the architecture.
- Changes:
- Add a strong host CTA on the landing screen.
- Add a 3-step “how it works” overview near the top.
- Standardize terminology:
- `player link`
- `player code`
- `reveal link`
- Reduce duplicate wording around “lock”, “share”, and “game night”.
- Add a short explanation line to the player and host screens.
- Success criteria:
- A first-time host can explain the system after 30 seconds on the landing/setup screens.

## Phase 2: guided setup and host workflow
- Goal: make the host flow feel sequential instead of tool-like.
- Changes:
- Convert setup into clear sections with step states.
- Move scoring below players/questions and visually de-emphasize it.
- Add setup completion feedback:
- enough players
- enough questions
- ready to create player link
- After finalization, replace the generic panel with a host checklist.
- Success criteria:
- A host can complete setup without reading long paragraphs.

## Phase 3: player confidence
- Goal: reduce hesitation and confusion in the player flow.
- Changes:
- Show the game title prominently in player mode.
- Add a short “why this works” line before ranking begins.
- Make progress clearer and more persistent.
- Keep the final send-back step visually simple:
- copy player code
- send to host
- done
- Success criteria:
- A player should not need external explanation to know what to send back.

## Phase 4: host collection simplification
- Goal: make collection feel less technical.
- Changes:
- Improve the collection screen copy and framing.
- Consider a structured import list instead of only a raw textarea.
- Show missing players more prominently than successful ones.
- Make no-show removal feel intentional and safe.
- Success criteria:
- The host understands who is still missing and what action to take next.

## Phase 5: reveal preflight and payoff
- Goal: make the transition into presentation mode feel intentional.
- Changes:
- Add a short preflight checklist before reveal:
- everyone submitted
- big-screen link ready
- fullscreen recommended
- Clarify the button labels around opening the reveal.
- Improve the emotional framing of the reveal start.
- Success criteria:
- The host feels like they are moving into “presentation mode”, not just another screen.

## Suggested implementation order
1. Rewrite terminology and add host/player explanatory copy.
2. Add landing-page overview and stronger CTA hierarchy.
3. Reorganize setup into a guided sequence.
4. Redesign the host collection surface around a checklist.
5. Refine reveal preflight language and actions.

## Testing roadmap for UX work
- Add Playwright checks for copy and CTA hierarchy on the landing screen.
- Add a Playwright test for the host checklist after finalization.
- Add a Playwright test for the player end state:
- ranking complete
- player code visible
- send-back instruction visible
- Add a Playwright test for no-show handling copy on the host screen.

## Concrete high-impact copy changes
- Replace generic prose with operational copy.
- Example direction:
- `Start a new game`
- `Send this player link to your group`
- `Each friend sends back one player code`
- `Open big-screen reveal`

## What not to do yet
- Do not add more technical states or more nouns.
- Do not add backend-style complexity to solve a clarity problem.
- Do not make scoring explanation the first decision the host sees.

## Summary
- The app does not have a core usability failure; it has a clarity hierarchy problem.
- The underlying flow is good, but the product currently explains itself like a clever prototype rather than a guided party tool.
- The roadmap should focus first on guidance, terminology, and screen hierarchy before bigger feature work.
