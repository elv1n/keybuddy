import { afterEach, describe, expect, it } from 'vitest';
import { bindKey, getBoundKeys, unbindAll } from '../index';

describe('getBoundKeys with sequences', () => {
  afterEach(() => {
    unbindAll();
  });

  it('should return full sequence string for sequence bindings', () => {
    bindKey('g i', () => {});

    const keys = getBoundKeys();
    expect(keys).toContain('g i');
    expect(keys).not.toContain('g');
  });

  it('should return standalone key for standalone bindings', () => {
    bindKey('cmd+k', () => {});

    const keys = getBoundKeys();
    expect(keys).toContain('cmd+k');
  });

  it('should return both when mixed', () => {
    bindKey('g i', () => {});
    bindKey('cmd+k', () => {});
    bindKey('ctrl+s', () => {});

    const keys = getBoundKeys();
    expect(keys).toContain('g i');
    expect(keys).toContain('cmd+k');
    expect(keys).toContain('ctrl+s');
    expect(keys).toHaveLength(3);
  });

  it('should return full multi-part sequence string', () => {
    bindKey('cmd+k cmd+s cmd+w', () => {});

    const keys = getBoundKeys();
    expect(keys).toContain('cmd+k cmd+s cmd+w');
    expect(keys).not.toContain('cmd+k');
  });

  it('should work with scopes', () => {
    bindKey('g i', 'editor', () => {});
    bindKey('ctrl+s', () => {});

    const editorKeys = getBoundKeys({ scope: 'editor' });
    expect(editorKeys).toContain('g i');
    expect(editorKeys).not.toContain('ctrl+s');

    const defaultKeys = getBoundKeys();
    expect(defaultKeys).toContain('ctrl+s');
    expect(defaultKeys).not.toContain('g i');
  });
});
