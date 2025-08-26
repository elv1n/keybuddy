/// <reference types="cypress" />

interface KeybuddyInstance {
  bind: (
    keysStr: string,
    scopeOrMethod: string | ((e: KeyboardEvent) => void),
    methodOrNull?: (e: KeyboardEvent) => void,
    options?: { skipOther: boolean },
  ) => void;
  bindKey: (
    keysStr: string,
    scopeOrMethod: string | ((e: KeyboardEvent) => void),
    methodOrNull?: (e: KeyboardEvent) => void,
    options?: { skipOther: boolean },
  ) => void;
  unbind: (keysStr: string, scope?: string) => void;
  unbindKey: (keysStr: string, scope?: string) => void;
  unsafeUnbind: (keysStr: string, scope?: string) => void;
  unsafeUnbindKey: (keysStr: string, scope?: string) => void;
  unbindScope: (scope: string) => void;
  setScope: (scope: string) => void;
  unbindAll: () => void;
  getScope: () => string;
  destroy: () => void;
}

declare namespace Cypress {
  interface Chainable {
    onReady(callback: (keybuddy: KeybuddyInstance) => void): Chainable<Window>;
  }
}

export {};
