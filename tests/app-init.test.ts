import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");

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
  dataset: Record<string, string> = {};
  disabled = false;
  href = "";
  id = "";
  style: Record<string, string> = {};
  tagName: string;
  textContent = "";
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
    const list = this.listeners.get("click") ?? [];
    list.forEach((listener) => listener({ target: this }));
  }

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

  getItem(key: string): string | null {
    return this.#store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, value);
  }
}

class FakeLocation {
  hash = "";
  href = "http://localhost/";
}

async function bootstrapApp(): Promise<{
  document: FakeDocument;
}> {
  const fakeDocument = new FakeDocument();
  const fakeLocation = new FakeLocation();
  globalThis.document = fakeDocument as unknown as Document;
  globalThis.window = {
    addEventListener: () => {},
  } as unknown as Window;
  Object.defineProperty(globalThis, "navigator", {
    value: { language: "en-US" },
    configurable: true,
  });
  globalThis.localStorage = new FakeStorage() as unknown as Storage;
  globalThis.location = fakeLocation as unknown as Location;
  globalThis.btoa = (input: string) => Buffer.from(input, "binary").toString("base64");
  globalThis.atob = (input: string) => Buffer.from(input, "base64").toString("binary");

  const appUrl = pathToFileURL(path.join(ROOT_DIR, "app.ts")).href;
  await import(`${appUrl}?test=${Date.now()}`);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { document: fakeDocument };
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
