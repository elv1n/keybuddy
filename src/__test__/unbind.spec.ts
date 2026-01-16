import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bindKey,
  isBound,
  unbindAll,
  unbindKey,
  unsafeUnbindKey,
} from '../index';

describe('unbind with sequences', () => {
  afterEach(() => {
    unbindAll();
  });

  it('unbindKey should unbind sequence correctly', () => {
    const seqFn = vi.fn();

    bindKey('g i', seqFn);

    expect(isBound('g i')).toBe(true);

    unbindKey('g i', seqFn);

    expect(isBound('g i')).toBe(false);
  });

  it('unbindKey should unbind standalone correctly', () => {
    const standaloneFn = vi.fn();

    bindKey('g', standaloneFn);

    expect(isBound('g')).toBe(true);

    unbindKey('g', standaloneFn);

    expect(isBound('g')).toBe(false);
  });

  it('unsafeUnbindKey should unbind sequence correctly', () => {
    const seqFn = vi.fn();

    bindKey('g i', seqFn);

    expect(isBound('g i')).toBe(true);

    unsafeUnbindKey('g i');

    expect(isBound('g i')).toBe(false);
  });

  it('unsafeUnbindKey should unbind standalone correctly', () => {
    const standaloneFn = vi.fn();

    bindKey('g', standaloneFn);

    expect(isBound('g')).toBe(true);

    unsafeUnbindKey('g');

    expect(isBound('g')).toBe(false);
  });

  it('should unbind multi-part sequence correctly', () => {
    const seqFn = vi.fn();

    bindKey('cmd+k cmd+s cmd+w', seqFn);

    expect(isBound('cmd+k cmd+s cmd+w')).toBe(true);

    unbindKey('cmd+k cmd+s cmd+w', seqFn);

    expect(isBound('cmd+k cmd+s cmd+w')).toBe(false);
  });

  it('should only unbind the specific sequence when multiple sequences exist', () => {
    const seqFn1 = vi.fn();
    const seqFn2 = vi.fn();

    bindKey('g i', seqFn1);
    bindKey('g o', seqFn2);

    unbindKey('g i', seqFn1);

    expect(isBound('g i')).toBe(false);
    expect(isBound('g o')).toBe(true);
  });

  it('unsafeUnbindKey should only unbind the specific sequence pattern', () => {
    const seqFn1 = vi.fn();
    const seqFn2 = vi.fn();

    bindKey('g i', seqFn1);
    bindKey('g o', seqFn2);

    unsafeUnbindKey('g i');

    expect(isBound('g i')).toBe(false);
    expect(isBound('g o')).toBe(true);
  });
});
