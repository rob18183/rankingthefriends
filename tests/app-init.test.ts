import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const STORAGE_KEY = "ryf:game";

class FakeClassList {
  #classes = new Set<string>();

  add(...names: string[]): void {
    names.forEach((name) => this.#classes.add(name));
  }

  remove(...names: string[]): void {
    names.forEach((name) => this.#classes.delete(name));
  }

  contains(name: string): boolean {
    return this.#classes.has(name);
  }

  toggle(name: string, force?: boolean): boolean {
    if (typeof force === "boolean") {
      if (force) this.#classes.add(name);
      else this.#classes.delete(name);
      return force;
    }
    if (this.#classes.has(name)) {
      this.#classes.delete(name);
      return false;
    }
    this.#classes.add(name);
    return true;
  }
}

type Listener = (event: { target: FakeElement }) => void;

class FakeElement {
  children: FakeElement[] = [];
  classList = new FakeClassList();
  className = "";
  dataset: Record<string, string> = {};
  disabled = false;
  draggable = false;
  href = "";
  id = "";
  style: Record<string, string> = {};
  tagName: string;
  textContent = "";
  type = "";
  value = "";
  private listeners = new Map<string, Listener[]>();

  constructor(tagName = "div") {
    this.tagName = tagName;
  }

  appendChild(child: FakeElement): FakeElement {
    this.children.push(child);
    return child;
  }

  setAttribute(name: string, value: string): void {
    if (name.startsWith("data-")) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      this.dataset[key] = value;
      return;
    }
    if (name === "id") this.id = value;
  }

  addEventListener(type: string, listener: Listener): void {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  click(): void {
    this.trigger("click");
  }

  trigger(type: string): void {
    const list = this.listeners.get(type) ?? [];
    list.forEach((listener) => listener({ target: this }));
  }

  select(): void {}

  get innerHTML(): string {
    return "";
  }

  set innerHTML(value: string) {
    if (value === "") this.children = [];
  }

  get options(): FakeElement[] {
    return this.children;
  }
}

class FakeDocument {
  documentElement = new FakeElement("html");
  title = "";
  private elements = new Map<string, FakeElement>();

  getElementById(id: string): FakeElement {
    if (!this.elements.has(id)) {
      const element = new FakeElement();
      element.id = id;
      this.elements.set(id, element);
    }
    return this.elements.get(id) as FakeElement;
  }

  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }

  querySelectorAll(): FakeElement[] {
    return [];
  }

  execCommand(): boolean {
    return true;
  }
}

class FakeStorage {
  #store = new Map<string, string>();

  constructor(initialEntries: Record<string, string> = {}) {
    Object.entries(initialEntries).forEach(([key, value]) => this.#store.set(key, value));
  }

  getItem(key: string): string | null {
    return this.#store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, value);
  }
}

class FakeLocation {
  hash: string;
  href = "http://localhost/";

  constructor(hash = "") {
    this.hash = hash;
  }
}

type BootstrapOptions = {
  hash?: string;
  storage?: Record<string, string>;
};

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function bootstrapApp(options: BootstrapOptions = {}): Promise<{
  document: FakeDocument;
}> {
  const fakeDocument = new FakeDocument();
  const fakeLocation = new FakeLocation(options.hash);
  globalThis.document = fakeDocument as unknown as Document;
  globalThis.window = {
    addEventListener: () => {},
  } as unknown as Window & typeof globalThis;
  Object.defineProperty(globalThis, "navigator", {
    value: { language: "en-US" },
    configurable: true,
  });
  globalThis.localStorage = new FakeStorage(options.storage) as unknown as Storage;
  globalThis.location = fakeLocation as unknown as Location;
  globalThis.btoa = (input: string) => Buffer.from(input, "binary").toString("base64");
  globalThis.atob = (input: string) => Buffer.from(input, "base64").toString("binary");

  const appUrl = pathToFileURL(path.join(ROOT_DIR, "app.ts")).href;
  await import(`${appUrl}?test=${Date.now()}`);
  await flush();
  return { document: fakeDocument };
}

function encodePayload(obj: object): string {
  const json = JSON.stringify(obj);
  return Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createStoredGame(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    version: 1,
    gameId: "game_test_1",
    title: "Test Night",
    createdAt: "2026-03-23T10:00:00.000Z",
    finalizedAt: "2026-03-23T10:05:00.000Z",
    players: [
      { id: "p1", name: "Laure" },
      { id: "p2", name: "Katy" },
    ],
    questions: [{ id: "q1", text: "Best snack curator", presenterId: "p1" }],
    submissions: {},
    settings: { scoring: "weighted", reveal: "rounds" },
    ...overrides,
  });
}

test("app bootstraps language options and nav click behavior", async () => {
  const { document } = await bootstrapApp();
  const languageSelect = document.getElementById("language-select");
  assert.ok(languageSelect.options.length >= 2, "expected language options to be populated");

  const viewSetup = document.getElementById("view-setup");
  const viewHost = document.getElementById("view-host");
  assert.ok(!viewSetup.classList.contains("hidden"), "setup should be visible initially");
  assert.ok(viewHost.classList.contains("hidden"), "host should be hidden initially");

  const navHost = document.getElementById("nav-host");
  navHost.click();

  assert.ok(viewHost.classList.contains("hidden") === false, "host should be visible after click");
  assert.ok(viewSetup.classList.contains("hidden"), "setup should be hidden after click");
});

test("invalid shared hashes show an error instead of loading local draft data", async () => {
  const { document } = await bootstrapApp({
    hash: "#v=player&g=not-valid-base64",
    storage: {
      [STORAGE_KEY]: createStoredGame({ title: "Local Draft That Must Not Load" }),
    },
  });

  assert.equal(
    document.getElementById("app-error").textContent,
    "This game link is invalid or expired.",
  );
  assert.equal(document.getElementById("game-title").value, "");
  assert.ok(!document.getElementById("view-setup").classList.contains("hidden"));
  assert.ok(document.getElementById("view-player").classList.contains("hidden"));
});

test("finalized games restore the share URL and backup code on reload", async () => {
  const { document } = await bootstrapApp({
    storage: {
      [STORAGE_KEY]: createStoredGame(),
    },
  });

  assert.match(document.getElementById("share-url").value, /#v=player&g=/);
  assert.notEqual(document.getElementById("game-code").value, "");
});

test("host import accepts payload-only lines and marks the matching player submitted", async () => {
  const { document } = await bootstrapApp({
    storage: {
      [STORAGE_KEY]: createStoredGame(),
    },
  });

  const payload = encodePayload({
    version: 1,
    gameId: "game_test_1",
    playerId: "p1",
    submittedAt: "2026-03-23T10:10:00.000Z",
    byQuestion: {
      q1: ["p1", "p2"],
    },
  });

  document.getElementById("nav-host").click();
  const importText = document.getElementById("import-text");
  importText.value = payload;
  document.getElementById("import-submit").click();
  await flush();

  const submissionStatus = document.getElementById("submission-status");
  assert.match(submissionStatus.children[0]?.children[0]?.textContent ?? "", /Submitted/);
  assert.ok(document.getElementById("import-error").classList.contains("hidden"));
});

test("host can remove a finalized no-show player and continue with recalculated state", async () => {
  const { document } = await bootstrapApp({
    storage: {
      [STORAGE_KEY]: createStoredGame({
        players: [
          { id: "p1", name: "Laure" },
          { id: "p2", name: "Katy" },
          { id: "p3", name: "Marieke" },
        ],
        submissions: {
          p1: {
            playerId: "p1",
            byQuestion: { q1: ["p1", "p2", "p3"] },
          },
          p2: {
            playerId: "p2",
            byQuestion: { q1: ["p2", "p1", "p3"] },
          },
        },
      }),
    },
  });

  document.getElementById("nav-host").click();
  const submissionStatus = document.getElementById("submission-status");
  submissionStatus.children[2].children[1].click();
  await flush();
  await flush();

  assert.equal(submissionStatus.children.length, 2);
  assert.equal(document.getElementById("start-reveal").disabled, false);
  assert.match(document.getElementById("share-url").value, /#v=player&g=/);
});

test("setup validation rejects duplicate names that differ only by case", async () => {
  const { document } = await bootstrapApp();

  document.getElementById("add-player").click();
  document.getElementById("add-player").click();
  document.getElementById("add-question").click();

  const playerRows = document.getElementById("players-list").children;
  playerRows[0].children[0].value = "Laure";
  playerRows[0].children[0].trigger("input");
  playerRows[1].children[0].value = "laure";
  playerRows[1].children[0].trigger("input");

  const questionRows = document.getElementById("questions-list").children;
  questionRows[0].children[0].value = "Best snack curator";
  questionRows[0].children[0].trigger("input");

  document.getElementById("finalize-game").click();

  assert.equal(document.getElementById("setup-error").textContent, "Player names must be unique.");
});
