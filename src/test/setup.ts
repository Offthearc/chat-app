import '@testing-library/jest-dom';

window.HTMLElement.prototype.scrollIntoView = () => {};

// Provide a working localStorage implementation for jsdom
let lsStore: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => lsStore[key] ?? null,
  setItem: (key: string, value: string) => { lsStore[key] = String(value); },
  removeItem: (key: string) => { delete lsStore[key]; },
  clear: () => { lsStore = {}; },
  get length() { return Object.keys(lsStore).length; },
  key: (index: number) => Object.keys(lsStore)[index] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  constructor(name: string) {
    this.name = name;
  }
  postMessage(): void {}
  close(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true;
  }
}

Object.defineProperty(window, 'BroadcastChannel', {
  writable: true,
  value: MockBroadcastChannel,
});
