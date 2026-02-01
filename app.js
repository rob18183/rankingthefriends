import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm";
import {
  addPlayer,
  addQuestion,
  advanceReveal,
  buildConsensusRanking,
  getRevealMaxSteps,
  moveRanking,
  normalizeScoring,
  rewindReveal,
  scoreRound,
  scoreTotalsThrough,
  sortScores,
} from "./game-logic.js";

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
      inspiration: "3. Inspiration",
    },
    setup: {
      title: "Setup",
      description:
        "Add players and questions. When you lock the game, the setup freezes and a share link is generated for your players.",
      gameTitle: "Game title",
      gameTitlePlaceholder: "Friday night rankings",
      chooseScoring: "Choose scoring",
      simpleTitle: "Simple (exact ranks)",
      simpleDesc: "Score 1 point for every player placed in the exact position (e.g. John is fourth).",
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
      players: "Players",
      questions: "Questions",
      suggestedTitle: "Suggested questions",
      suggestedHint: "Pick from a quick starter list or jump to the inspiration page for more ideas.",
      suggestedAddTop: "Add top 10",
      suggestedMore: "More inspiration",
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
      pageTitle: "Ranking your Friend - {game}",
      defaultGameTitle: "Game Night",
      readyTitle: "Ready to present?",
      readyHint: "Go fullscreen for the best vibe.",
      fullscreen: "Go fullscreen",
      skipFullscreen: "Continue without fullscreen",
      promptTitle: "{presenter}, come forward",
      promptLine:
        "{presenter} kicks things off. Read the question out loud before the reveal begins.",
      questionLabel: "Question",
      presenterNote: "Presenter:",
      progressLabel: "Question {current} of {total}",
      nextQuestionFirst: "First Ranking Question",
      nextQuestion: "Next Ranking Question",
      nextPresenterReveal: "Reveal top {rank} {presenter}",
      nextGroupReveal: "Reveal Group top {rank}",
      showRoundScore: "Show Score",
      showTotalScore: "Show Total Score",
      showFinale: "Show Finale",
      roundScoreIntro: "Let's see what the scores are for this round.",
      roundScore: "Round score",
      totalScore: "Total score",
      endTitle: "Finale!",
      endIntro: "Here's how the leaderboard evolved across the night.",
      back: "Back",
      next: "Next",
    },
    labels: {
      addPlayer: "Add player",
      addQuestion: "Add question",
      add: "Add",
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
      group: "Group",
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
      totalSimple: "Running total with simple scoring (shown starting in round 2).",
      totalWeighted: "Running total with weighted scoring (shown starting in round 2).",
    },
    language: {
      label: "Language",
    },
    inspiration: {
      title: "Question inspiration",
      description: "Browse categories and tap a question to add it to your game.",
      categories: {
        funny: "Funny / chaotic energy",
        party: "Party & social life",
        sweet: "Sweet / compliment style",
        nerdy: "Smart / nerdy",
        embarrassing: "Slightly embarrassing (but harmless)",
        habits: "Daily life / habits",
        dating: "Dating / relationships",
        travel: "Travel / adventure",
        chaos: "Chaos bonus round",
      },
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
      inspiration: "3. Inspiratie",
    },
    setup: {
      title: "Instellen",
      description:
        "Voeg spelers en vragen toe. Wanneer je het spel vergrendelt, wordt de setup bevroren en wordt er een deel-link voor spelers gemaakt.",
      gameTitle: "Speltitel",
      gameTitlePlaceholder: "Vrijdagavond ranglijst",
      chooseScoring: "Kies scoring",
      simpleTitle: "Simpel (exacte posities)",
      simpleDesc: "Scoor 1 punt voor elke speler op de juiste plek (bijv. John is vierde).",
      simpleProsLabel: "Voordelen:",
      simplePros: "makkelijk uit te leggen en beloont perfecte hits.",
      simpleConsLabel: "Nadelen:",
      simpleCons: "bijna goed levert niks op.",
      weightedTitle: "Gewogen (afstand)",
      weightedDesc:
        "Scoor meer punten wanneer je rangorde dichter bij de groepsconsensus zit en minder punten als je ernaast zit.",
      weightedProsLabel: "Voordelen:",
      weightedPros: "beloont bijna-goed en houdt scores spannend.",
      weightedConsLabel: "Nadelen:",
      weightedCons: "heeft een korte uitleg nodig.",
      players: "Spelers",
      questions: "Vragen",
      suggestedTitle: "Vragen ter inspiratie",
      suggestedHint: "Kies uit een snelle startlijst of ga naar de inspiratiepagina voor meer ideeën.",
      suggestedAddTop: "Top 10 toevoegen",
      suggestedMore: "Meer inspiratie",
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
      pageTitle: "Ranking your Friend - {game}",
      defaultGameTitle: "Spelavond",
      readyTitle: "Klaar om te presenteren?",
      readyHint: "Ga fullscreen voor de beste vibe.",
      fullscreen: "Ga fullscreen",
      skipFullscreen: "Ga door zonder fullscreen",
      promptTitle: "{presenter}, kom naar voren",
      promptLine:
        "{presenter} trapt af. Lees de vraag hardop voordat de reveal begint.",
      questionLabel: "Vraag",
      presenterNote: "Presentator:",
      progressLabel: "Vraag {current} van {total}",
      nextQuestionFirst: "Eerste rankingvraag",
      nextQuestion: "Volgende rankingvraag",
      nextPresenterReveal: "Onthul top {rank} van {presenter}",
      nextGroupReveal: "Onthul groep top {rank}",
      showRoundScore: "Toon score",
      showTotalScore: "Toon totaalscore",
      showFinale: "Toon finale",
      roundScoreIntro: "Laten we de scores voor deze ronde zien.",
      roundScore: "Rondescore",
      totalScore: "Totaalscore",
      endTitle: "Finale!",
      endIntro: "Zo veranderde het klassement door de avond heen.",
      back: "Terug",
      next: "Volgende",
    },
    labels: {
      addPlayer: "Speler toevoegen",
      addQuestion: "Vraag toevoegen",
      add: "Toevoegen",
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
      group: "Groep",
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
      totalSimple: "Totaalscore met simpele scoring (vanaf ronde 2).",
      totalWeighted: "Totaalscore met gewogen scoring (vanaf ronde 2).",
    },
    language: {
      label: "Taal",
    },
    inspiration: {
      title: "Vraaginspiratie",
      description: "Blader door categorieën en tik een vraag aan om toe te voegen aan je spel.",
      categories: {
        funny: "Grappig / chaotische energie",
        party: "Feest & sociaal leven",
        sweet: "Lief / compliment",
        nerdy: "Slim / nerdy",
        embarrassing: "Licht gênant (maar onschuldig)",
        habits: "Dagelijks leven / gewoontes",
        dating: "Dating / relaties",
        travel: "Reizen / avontuur",
        chaos: "Chaos bonusronde",
      },
    },
  },
};

const roundScoreQuips = {
  en: [
    "{name} is taking the lead!",
    "Did you see that? {name} is pulling ahead.",
    "{name} really gave you an ass whooping.",
    "{name}, are you really trying?",
    "The crowd goes wild for {name}.",
  ],
  nl: [
    "{name} pakt de leiding!",
    "Zie je dat? {name} loopt uit.",
    "{name} gaf jullie net een pak rammel.",
    "{name}, doe je wel echt je best?",
    "Het publiek gaat los voor {name}.",
  ],
};

const questionBank = [
  {
    id: "lost",
    category: "funny",
    text: { nl: "Wie raakt het vaakst iets kwijt?", en: "Who loses things most often?" },
  },
  {
    id: "late",
    category: "funny",
    text: { nl: "Wie komt altijd nét te laat?", en: "Who always arrives just a little late?" },
  },
  {
    id: "direction",
    category: "funny",
    text: { nl: "Wie heeft de slechtste richtingsgevoel?", en: "Who has the worst sense of direction?" },
  },
  {
    id: "fire-alarm",
    category: "funny",
    text: {
      nl: "Wie zou per ongeluk een brandalarm activeren?",
      en: "Who would accidentally set off a fire alarm?",
    },
  },
  {
    id: "typos",
    category: "funny",
    text: {
      nl: "Wie maakt de meeste typefouten in groepsapps?",
      en: "Who makes the most typos in group chats?",
    },
  },
  {
    id: "party",
    category: "party",
    text: { nl: "Wie is altijd in voor een feestje?", en: "Who is always down to party?" },
  },
  {
    id: "last-to-bed",
    category: "party",
    text: {
      nl: "Wie gaat het laatst naar bed op een avond uit?",
      en: "Who goes to bed latest on a night out?",
    },
  },
  {
    id: "wild-dancer",
    category: "party",
    text: { nl: "Wie danst het gekst?", en: "Who dances the wildest?" },
  },
  {
    id: "bartender",
    category: "party",
    text: { nl: "Wie is de beste bartender?", en: "Who would make the best bartender?" },
  },
  {
    id: "fast-drunk",
    category: "party",
    text: { nl: "Wie wordt het snelst dronken?", en: "Who gets drunk the quickest?" },
  },
  {
    id: "deep-chat",
    category: "party",
    text: {
      nl: "Wie start het vaakst een diep gesprek om 3 uur ’s nachts?",
      en: "Who starts the deepest 3 a.m. conversations?",
    },
  },
  {
    id: "caring",
    category: "sweet",
    text: { nl: "Wie is het meest zorgzaam?", en: "Who is the most caring?" },
  },
  {
    id: "funniest",
    category: "sweet",
    text: { nl: "Wie is het grappigst?", en: "Who is the funniest?" },
  },
  {
    id: "best-advice",
    category: "sweet",
    text: { nl: "Wie geeft de beste adviezen?", en: "Who gives the best advice?" },
  },
  {
    id: "loyal",
    category: "sweet",
    text: { nl: "Wie is het meest loyaal?", en: "Who is the most loyal?" },
  },
  {
    id: "laughs",
    category: "sweet",
    text: {
      nl: "Wie maakt iedereen aan het lachen?",
      en: "Who makes everyone laugh the most?",
    },
  },
  {
    id: "empathy",
    category: "sweet",
    text: { nl: "Wie is het meest empathisch?", en: "Who is the most empathetic?" },
  },
  {
    id: "random-facts",
    category: "nerdy",
    text: { nl: "Wie weet altijd random feitjes?", en: "Who always knows random facts?" },
  },
  {
    id: "competitive",
    category: "nerdy",
    text: { nl: "Wie is het meest competitief?", en: "Who is the most competitive?" },
  },
  {
    id: "quiz",
    category: "nerdy",
    text: { nl: "Wie zou een quiz winnen?", en: "Who would win a quiz?" },
  },
  {
    id: "planner",
    category: "nerdy",
    text: {
      nl: "Wie plant alles het beste vooruit?",
      en: "Who plans everything the best ahead of time?",
    },
  },
  {
    id: "creative",
    category: "nerdy",
    text: { nl: "Wie is het meest creatief?", en: "Who is the most creative?" },
  },
  {
    id: "run-business",
    category: "nerdy",
    text: { nl: "Wie zou het beste een bedrijf runnen?", en: "Who would run a company best?" },
  },
  {
    id: "bad-music",
    category: "embarrassing",
    text: { nl: "Wie heeft de slechtste muzieksmaak?", en: "Who has the worst music taste?" },
  },
  {
    id: "cry-movie",
    category: "embarrassing",
    text: { nl: "Wie zou het snelst huilen bij een film?", en: "Who would cry fastest in a movie?" },
  },
  {
    id: "talk-self",
    category: "embarrassing",
    text: { nl: "Wie praat het meest in zichzelf?", en: "Who talks to themselves the most?" },
  },
  {
    id: "guilty-pleasure",
    category: "embarrassing",
    text: {
      nl: "Wie heeft de vreemdste guilty pleasure?",
      en: "Who has the weirdest guilty pleasure?",
    },
  },
  {
    id: "fast-reply",
    category: "embarrassing",
    text: { nl: "Wie appt het snelst terug?", en: "Who replies the fastest to messages?" },
  },
  {
    id: "chaotic-home",
    category: "embarrassing",
    text: { nl: "Wie is het meest chaotisch thuis?", en: "Who is the messiest at home?" },
  },
  {
    id: "on-time",
    category: "habits",
    text: { nl: "Wie is het meest op tijd?", en: "Who is the most on time?" },
  },
  {
    id: "messiest",
    category: "habits",
    text: { nl: "Wie is het slordigst?", en: "Who is the messiest?" },
  },
  {
    id: "unhealthy",
    category: "habits",
    text: { nl: "Wie eet het meest ongezond?", en: "Who eats the most unhealthy?" },
  },
  {
    id: "exercise",
    category: "habits",
    text: { nl: "Wie sport het vaakst?", en: "Who works out the most?" },
  },
  {
    id: "coffee",
    category: "habits",
    text: { nl: "Wie is het meest verslaafd aan koffie?", en: "Who is most addicted to coffee?" },
  },
  {
    id: "tiktok",
    category: "habits",
    text: {
      nl: "Wie zit het langst op TikTok/Instagram?",
      en: "Who spends the longest on TikTok/Instagram?",
    },
  },
  {
    id: "flirt",
    category: "dating",
    text: { nl: "Wie flirt het makkelijkst?", en: "Who flirts the easiest?" },
  },
  {
    id: "marry",
    category: "dating",
    text: { nl: "Wie zou het eerst trouwen?", en: "Who would get married first?" },
  },
  {
    id: "dating-stories",
    category: "dating",
    text: {
      nl: "Wie heeft de meeste datingverhalen?",
      en: "Who has the most dating stories?",
    },
  },
  {
    id: "best-partner",
    category: "dating",
    text: { nl: "Wie zou de beste partner zijn?", en: "Who would be the best partner?" },
  },
  {
    id: "romantic",
    category: "dating",
    text: { nl: "Wie is het meest romantisch?", en: "Who is the most romantic?" },
  },
  {
    id: "jealous",
    category: "dating",
    text: { nl: "Wie is het meest jaloers?", en: "Who is the most jealous?" },
  },
  {
    id: "emigrate",
    category: "travel",
    text: { nl: "Wie zou het eerst emigreren?", en: "Who would emigrate first?" },
  },
  {
    id: "adventurous",
    category: "travel",
    text: { nl: "Wie is het meest avontuurlijk?", en: "Who is the most adventurous?" },
  },
  {
    id: "lost-vacation",
    category: "travel",
    text: { nl: "Wie zou verdwalen op vakantie?", en: "Who would get lost on vacation?" },
  },
  {
    id: "overpack",
    category: "travel",
    text: {
      nl: "Wie pakt altijd te veel spullen in?",
      en: "Who always overpacks?",
    },
  },
  {
    id: "last-minute",
    category: "travel",
    text: {
      nl: "Wie boekt alles last minute?",
      en: "Who books everything last minute?",
    },
  },
  {
    id: "desert-island",
    category: "travel",
    text: {
      nl: "Wie zou het beste overleven op een onbewoond eiland?",
      en: "Who would survive best on a deserted island?",
    },
  },
  {
    id: "arrested",
    category: "chaos",
    text: {
      nl: "Wie zou het eerst gearresteerd worden (per ongeluk)?",
      en: "Who would get arrested first (by accident)?",
    },
  },
  {
    id: "conspiracy",
    category: "chaos",
    text: {
      nl: "Wie zou het snelst een complottheorie geloven?",
      en: "Who would believe a conspiracy theory the fastest?",
    },
  },
  {
    id: "no-phone",
    category: "chaos",
    text: {
      nl: "Wie zou een week zonder telefoon niet overleven?",
      en: "Who couldn't survive a week without their phone?",
    },
  },
  {
    id: "accidental-famous",
    category: "chaos",
    text: {
      nl: "Wie zou per ongeluk beroemd worden?",
      en: "Who would accidentally become famous?",
    },
  },
  {
    id: "tattoo-vacation",
    category: "chaos",
    text: {
      nl: "Wie zou het eerst een tattoo nemen op vakantie?",
      en: "Who would get a vacation tattoo first?",
    },
  },
];

const topQuestionIds = [
  "lost",
  "party",
  "caring",
  "random-facts",
  "bad-music",
  "on-time",
  "flirt",
  "adventurous",
  "late",
  "accidental-famous",
];

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
  navInspiration: document.getElementById("nav-inspiration"),
  languageSelect: document.getElementById("language-select"),
  viewSetup: document.getElementById("view-setup"),
  viewPlayer: document.getElementById("view-player"),
  viewHost: document.getElementById("view-host"),
  viewReveal: document.getElementById("view-reveal"),
  viewInspiration: document.getElementById("view-inspiration"),
  gameTitle: document.getElementById("game-title"),
  playersList: document.getElementById("players-list"),
  addPlayer: document.getElementById("add-player"),
  questionsList: document.getElementById("questions-list"),
  addQuestion: document.getElementById("add-question"),
  suggestedQuestions: document.getElementById("suggested-questions"),
  addTopQuestions: document.getElementById("add-top-questions"),
  openInspiration: document.getElementById("open-inspiration"),
  inspirationGroups: document.getElementById("inspiration-groups"),
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
  revealTitle: document.getElementById("reveal-title"),
  revealPromptTitle: document.getElementById("reveal-prompt-title"),
  revealPrompt: document.getElementById("reveal-prompt"),
  revealPresenterLine: document.getElementById("reveal-presenter-line"),
  revealPresenterLabel: document.getElementById("reveal-presenter-label"),
  revealQuestionPanel: document.getElementById("reveal-question-panel"),
  revealQuestionText: document.getElementById("reveal-question-text"),
  revealRankingPanel: document.getElementById("reveal-ranking-panel"),
  revealRankingTitle: document.getElementById("reveal-ranking-title"),
  revealColumnPresenter: document.getElementById("reveal-column-presenter"),
  revealProgressText: document.getElementById("reveal-progress-text"),
  revealProgressFill: document.getElementById("reveal-progress-fill"),
  revealProgressDots: document.getElementById("reveal-progress-dots"),
  revealRoundScorePanel: document.getElementById("reveal-roundscore-panel"),
  revealTotalPanel: document.getElementById("reveal-total-panel"),
  revealEndPanel: document.getElementById("reveal-end-panel"),
  revealScoreChart: document.getElementById("reveal-score-chart"),
  revealScoreLegend: document.getElementById("reveal-score-legend"),
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

function getQuestionText(question) {
  if (!question || !question.text) return "";
  return question.text[state.language] || question.text.en || "";
}

function getQuestionCategoryLabel(category) {
  return t(`inspiration.categories.${category}`);
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
  el.viewInspiration.classList.toggle("hidden", view !== "inspiration");
  el.navBar.classList.toggle("hidden", view === "player");
  el.appHeader.classList.toggle("hidden", view === "reveal");
  if (view === "player") renderPlayerStep();
  el.navSetup.classList.toggle("active", view === "setup");
  el.navHost.classList.toggle("active", view === "host");
  if (el.navInspiration) {
    el.navInspiration.classList.toggle("active", view === "inspiration");
  }
  if (view !== "reveal") {
    document.title = t("app.title");
  }
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

function addQuestionText(text) {
  if (state.game.finalizedAt) return;
  const normalized = text.trim();
  if (!normalized) return;
  const exists = state.game.questions.some(
    (question) => question.text.trim().toLowerCase() === normalized.toLowerCase()
  );
  if (exists) return;
  const index = state.game.questions.length;
  state.game = addQuestion(state.game, {
    id: createId("q"),
    text: normalized,
    presenterId: getDefaultPresenterId(index),
  });
  handleSetupChange();
  renderQuestionsList();
  renderPlayerQuestion();
}

function addQuestionsFromIds(ids) {
  ids.forEach((id) => {
    const question = questionBank.find((item) => item.id === id);
    if (!question) return;
    addQuestionText(getQuestionText(question));
  });
}

function renderSuggestedQuestions() {
  if (!el.suggestedQuestions) return;
  el.suggestedQuestions.innerHTML = "";
  topQuestionIds.forEach((id) => {
    const question = questionBank.find((item) => item.id === id);
    if (!question) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill";
    button.textContent = getQuestionText(question);
    button.addEventListener("click", () => addQuestionText(getQuestionText(question)));
    button.disabled = Boolean(state.game.finalizedAt);
    el.suggestedQuestions.appendChild(button);
  });
}

function renderInspirationGroups() {
  if (!el.inspirationGroups) return;
  el.inspirationGroups.innerHTML = "";
  const categories = Array.from(new Set(questionBank.map((question) => question.category)));
  categories.forEach((category) => {
    const group = document.createElement("div");
    group.className = "card";
    const title = document.createElement("h3");
    title.textContent = getQuestionCategoryLabel(category);
    group.appendChild(title);
    const list = document.createElement("div");
    list.className = "pill-grid";
    questionBank
      .filter((question) => question.category === category)
      .forEach((question) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pill";
        button.textContent = getQuestionText(question);
        button.addEventListener("click", () => addQuestionText(getQuestionText(question)));
        button.disabled = Boolean(state.game.finalizedAt);
        list.appendChild(button);
      });
    group.appendChild(list);
    el.inspirationGroups.appendChild(group);
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
      up.addEventListener("click", () => updateRanking(question.id, playerId, -1));
      const down = document.createElement("button");
      down.className = "rank-btn";
      down.type = "button";
      down.textContent = t("labels.down");
      down.disabled = position === ranking.length - 1 || state.playerForm.markedSubmitted;
      down.addEventListener("click", () => updateRanking(question.id, playerId, 1));
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

function updateRanking(questionId, playerId, delta) {
  const ranking = state.playerForm.byQuestion[questionId];
  const next = moveRanking(ranking, playerId, delta);
  if (next === ranking) return;
  state.playerForm.byQuestion[questionId] = next;
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

// Scoring helpers live in game-logic.js

function getScoringMode() {
  return normalizeScoring(state.game.settings?.scoring);
}

function setScoringMode(value) {
  state.game.settings = { ...state.game.settings, scoring: normalizeScoring(value) };
  saveGameLocal(state.game);
}

function renderScoringOptions() {
  if (!el.scoringSimple || !el.scoringWeighted) return;
  const scoringMode = getScoringMode();
  el.scoringSimple.checked = scoringMode === "simple";
  el.scoringWeighted.checked = scoringMode === "weighted";
  const disabled = Boolean(state.game.finalizedAt);
  el.scoringSimple.disabled = disabled;
  el.scoringWeighted.disabled = disabled;
}

// Scoring helpers live in game-logic.js

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

function getRevealGameTitle() {
  const rawTitle = state.game.title ? state.game.title.trim() : "";
  return rawTitle || t("reveal.defaultGameTitle");
}

function getRevealProgressLabel(totalQuestions) {
  const current = totalQuestions ? Math.min(state.revealIndex + 1, totalQuestions) : 0;
  return t("reveal.progressLabel", { current, total: totalQuestions || 0 });
}

function renderRevealProgress(totalQuestions) {
  if (!el.revealProgressText || !el.revealProgressFill || !el.revealProgressDots) return;
  el.revealProgressText.textContent = getRevealProgressLabel(totalQuestions);
  const progress = totalQuestions ? Math.min((state.revealIndex + 1) / totalQuestions, 1) : 0;
  el.revealProgressFill.style.width = `${progress * 100}%`;
  el.revealProgressDots.innerHTML = "";
  for (let i = 0; i < totalQuestions; i += 1) {
    const dot = document.createElement("span");
    if (i <= state.revealIndex || state.revealPhase === "end") dot.classList.add("active");
    el.revealProgressDots.appendChild(dot);
  }
}

function getRevealNextLabel({
  presenterName,
  maxSteps,
  totalQuestions,
  revealPhase,
  revealStep,
  revealIndex,
}) {
  if (revealPhase === "prompt") {
    return revealIndex === 0 ? t("reveal.nextQuestionFirst") : t("reveal.nextQuestion");
  }
  if (revealPhase === "question") {
    return t("reveal.nextPresenterReveal", { rank: 1, presenter: presenterName });
  }
  if (revealPhase === "reveal") {
    if (revealStep < maxSteps) {
      const nextStep = revealStep + 1;
      const rank = Math.ceil(nextStep / 2);
      if (nextStep % 2 === 1) {
        return t("reveal.nextPresenterReveal", { rank, presenter: presenterName });
      }
      return t("reveal.nextGroupReveal", { rank });
    }
    return t("reveal.showRoundScore");
  }
  if (revealPhase === "roundscore") {
    if (revealIndex >= 1) return t("reveal.showTotalScore");
    if (revealIndex < totalQuestions - 1) return t("reveal.nextQuestion");
    return t("reveal.showFinale");
  }
  if (revealPhase === "totals") {
    if (revealIndex < totalQuestions - 1) return t("reveal.nextQuestion");
    return t("reveal.showFinale");
  }
  return t("reveal.next");
}

function formatRoundScoreExplain(roundScores, presenterName) {
  const quips = roundScoreQuips[state.language] || roundScoreQuips.en;
  const sorted = sortScores(state.game, roundScores);
  const leaderName = sorted[0] ? sorted[0].player.name : presenterName;
  const quip = quips[state.revealIndex % quips.length] || "";
  const flavored = quip.replace("{name}", leaderName);
  return `${t("reveal.roundScoreIntro")} ${flavored}`.trim();
}

function buildScoreTimeline(scoringMode) {
  const totals = {};
  state.game.players.forEach((player) => {
    totals[player.id] = 0;
  });
  const series = state.game.players.map((player) => ({
    player,
    points: [],
  }));
  state.game.questions.forEach((question) => {
    const round = scoreRound(state.game, question.id, scoringMode);
    series.forEach((row) => {
      totals[row.player.id] += round[row.player.id] || 0;
      row.points.push(totals[row.player.id]);
    });
  });
  const max = series.reduce((currentMax, row) => {
    const rowMax = row.points.reduce((rowMaxValue, value) => Math.max(rowMaxValue, value), 0);
    return Math.max(currentMax, rowMax);
  }, 0);
  return { series, max };
}

function renderScoreChart(scoringMode) {
  if (!el.revealScoreChart || !el.revealScoreLegend) return;
  el.revealScoreChart.innerHTML = "";
  el.revealScoreLegend.innerHTML = "";
  const { series, max } = buildScoreTimeline(scoringMode);
  if (!series.length) return;
  const rounds = state.game.questions.length;
  const width = 600;
  const height = 240;
  const padding = 32;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  const colors = ["#7c3aed", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];
  series.forEach((row, index) => {
    const points = row.points.map((value, pointIndex) => {
      const x =
        padding +
        (rounds <= 1 ? 0 : (usableWidth * pointIndex) / (rounds - 1));
      const y =
        padding +
        usableHeight -
        (max ? (usableHeight * value) / max : 0);
      return `${x},${y}`;
    });
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    const color = colors[index % colors.length];
    polyline.setAttribute("points", points.join(" "));
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", color);
    polyline.setAttribute("stroke-width", "3");
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    svg.appendChild(polyline);
    const legendItem = document.createElement("span");
    const dot = document.createElement("i");
    dot.style.background = color;
    legendItem.appendChild(dot);
    legendItem.append(row.player.name);
    el.revealScoreLegend.appendChild(legendItem);
  });
  el.revealScoreChart.appendChild(svg);
}

function renderReveal() {
  const question = state.game.questions[state.revealIndex] || { text: t("labels.noQuestions") };
  const questionText = question.text || t("labels.untitledQuestion");
  el.revealQuestionText.textContent = questionText;
  const scoringMode = getScoringMode();
  const consensusOrder = question.id ? buildConsensusRanking(state.game, question.id) : [];
  const presenter = question.id ? getPresenterForQuestion(question, state.revealIndex) : null;
  const presenterRanking = question.id
    ? getPresenterRanking(question.id, presenter ? presenter.id : null)
    : [];
  const presenterName = presenter ? presenter.name : t("labels.presenterTbd");
  if (el.revealTitle && state.view === "reveal") {
    const revealTitle = t("reveal.pageTitle", { game: getRevealGameTitle() });
    el.revealTitle.textContent = revealTitle;
    document.title = revealTitle;
  }
  if (el.revealPromptTitle) {
    el.revealPromptTitle.textContent = t("reveal.promptTitle", { presenter: presenterName });
  }
  if (el.revealPresenterLine) {
    el.revealPresenterLine.textContent = t("reveal.promptLine", {
      presenter: presenterName,
    });
  }
  el.revealPresenterLabel.textContent = presenterName;
  if (el.revealRankingTitle) {
    el.revealRankingTitle.textContent = questionText;
  }
  if (el.revealColumnPresenter) {
    el.revealColumnPresenter.textContent = presenterName;
  }
  const roundScores = question.id ? scoreRound(state.game, question.id, scoringMode) : {};
  const showTotals = state.revealIndex >= 1;
  const totalScores = showTotals
    ? scoreTotalsThrough(state.game, state.revealIndex, scoringMode)
    : {};
  const maxSteps = getRevealMaxSteps(state.game, question.id);
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
  el.revealEndPanel.classList.toggle("hidden", state.revealPhase !== "end");
  if (state.revealPhase === "end") {
    renderScoreChart(scoringMode);
  } else if (el.revealScoreChart && el.revealScoreLegend) {
    el.revealScoreChart.innerHTML = "";
    el.revealScoreLegend.innerHTML = "";
  }
  renderScoringOptions();
  if (el.roundScoreExplain) {
    el.roundScoreExplain.textContent = formatRoundScoreExplain(roundScores, presenterName);
  }
  if (el.totalScoreExplain) {
    el.totalScoreExplain.textContent =
      scoringMode === "simple" ? t("scoring.totalSimple") : t("scoring.totalWeighted");
  }
  el.revealPrev.disabled = state.revealIndex <= 0 && state.revealPhase === "prompt";
  el.revealNext.disabled =
    state.revealPhase === "end" ||
    (state.revealIndex >= state.game.questions.length - 1 && state.revealPhase === "totals");
  if (el.revealNext) {
    el.revealNext.textContent = getRevealNextLabel({
      presenterName,
      maxSteps,
      totalQuestions: state.game.questions.length,
      revealPhase: state.revealPhase,
      revealStep: state.revealStep,
      revealIndex: state.revealIndex,
    });
  }
  renderRevealProgress(state.game.questions.length);
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
    const presenterValue = document.createElement("div");
    presenterValue.className = "reveal-pick";
    presenterValue.textContent = presenterVisible
      ? presenter
        ? presenter.name
        : t("labels.unknown")
      : "...";
    const groupValue = document.createElement("div");
    groupValue.className = "reveal-pick";
    groupValue.textContent = matchVisible
      ? consensus
        ? consensus.name
        : t("labels.unknown")
      : "...";
    picks.appendChild(presenterValue);
    picks.appendChild(groupValue);
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
  sortScores(state.game, scoreMap).forEach((row, index) => {
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
  renderSuggestedQuestions();
  renderInspirationGroups();
  renderPlayerSelect();
  renderPlayerQuestion();
  renderSubmissionStatus();
  renderScoringOptions();
  renderReveal();
  el.addPlayer.disabled = Boolean(state.game.finalizedAt);
  el.addQuestion.disabled = Boolean(state.game.finalizedAt);
  if (el.addTopQuestions) {
    el.addTopQuestions.disabled = Boolean(state.game.finalizedAt);
  }
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
if (el.navInspiration) {
  el.navInspiration.addEventListener("click", () => setView("inspiration"));
}
if (el.languageSelect) {
  el.languageSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });
}

if (el.addTopQuestions) {
  el.addTopQuestions.addEventListener("click", () => addQuestionsFromIds(topQuestionIds));
}

if (el.openInspiration) {
  el.openInspiration.addEventListener("click", () => setView("inspiration"));
}

el.gameTitle.addEventListener("input", () => {
  state.game.title = el.gameTitle.value;
  handleSetupChange();
});

el.addPlayer.addEventListener("click", () => {
  state.game = addPlayer(state.game, { id: createId("p"), name: "" });
  handleSetupChange();
  renderPlayersList();
  renderPlayerSelect();
});

el.addQuestion.addEventListener("click", () => {
  const index = state.game.questions.length;
  state.game = addQuestion(state.game, {
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
  const next = rewindReveal(
    {
      revealPhase: state.revealPhase,
      revealIndex: state.revealIndex,
      revealStep: state.revealStep,
    },
    state.game
  );
  state.revealPhase = next.revealPhase;
  state.revealIndex = next.revealIndex;
  state.revealStep = next.revealStep;
  renderReveal();
});

el.revealNext.addEventListener("click", () => {
  if (!state.revealFullscreenReady) return;
  const next = advanceReveal(
    {
      revealPhase: state.revealPhase,
      revealIndex: state.revealIndex,
      revealStep: state.revealStep,
    },
    state.game
  );
  state.revealPhase = next.revealPhase;
  state.revealIndex = next.revealIndex;
  state.revealStep = next.revealStep;
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
    renderAll();
  });
}

if (el.scoringWeighted) {
  el.scoringWeighted.addEventListener("change", (event) => {
    if (!event.target.checked) return;
    setScoringMode(event.target.value);
    renderAll();
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
  return question ? getRevealMaxSteps(state.game, question.id) : 0;
}

window.addEventListener("hashchange", initFromHash);

(async () => {
  state.language = getInitialLanguage();
  renderLanguageOptions();
  applyTranslations();
  ensureGame();
  await initFromHash();
})();
