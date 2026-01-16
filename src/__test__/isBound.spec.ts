import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindKey, isBound, unbindAll } from '../index';

describe('isBound with sequences', () => {
  afterEach(() => {
    unbindAll();
  });

  it('should return true only for exact sequence match', () => {
    bindKey('g i', () => {});

    expect(isBound('g i')).toBe(true);
    expect(isBound('g')).toBe(false); // standalone not bound
  });

  it('should return false for standalone when only sequence is bound', () => {
    bindKey('cmd+k e', () => {});

    expect(isBound('cmd+k e')).toBe(true);
    expect(isBound('cmd+k')).toBe(false);
  });

  it('should return false for sequence when only standalone is bound', () => {
    bindKey('cmd+k', () => {});

    expect(isBound('cmd+k')).toBe(true);
    expect(isBound('cmd+k e')).toBe(false);
  });

  it('should distinguish different sequences with same start', () => {
    bindKey('g i', () => {});

    expect(isBound('g i')).toBe(true);
    expect(isBound('g o')).toBe(false);
  });

  it('should handle multi-part sequences', () => {
    bindKey('cmd+k cmd+s cmd+w', () => {});

    expect(isBound('cmd+k cmd+s cmd+w')).toBe(true);
    expect(isBound('cmd+k cmd+s')).toBe(false);
    expect(isBound('cmd+k')).toBe(false);
  });

  it('should work with scopes', () => {
    bindKey('g i', 'editor', () => {});

    expect(isBound('g i', { scope: 'editor' })).toBe(true);
    expect(isBound('g i')).toBe(false); // default scope
  });
});
