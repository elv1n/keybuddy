import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindKey, getHandlers, unbindAll } from '../index';

describe('getHandlers with sequences', () => {
  afterEach(() => {
    unbindAll();
  });

  it('should return handlers only for exact sequence match', () => {
    const seqHandler1 = vi.fn();
    const seqHandler2 = vi.fn();

    bindKey('g i', seqHandler1);
    bindKey('g o', seqHandler2);

    const giHandlers = getHandlers('g i');
    expect(giHandlers).toContain(seqHandler1);
    expect(giHandlers).not.toContain(seqHandler2);

    const goHandlers = getHandlers('g o');
    expect(goHandlers).toContain(seqHandler2);
    expect(goHandlers).not.toContain(seqHandler1);
  });

  it('should return empty array for non-existent sequence', () => {
    bindKey('g i', () => {});

    expect(getHandlers('g o')).toEqual([]);
    expect(getHandlers('g')).toEqual([]);
  });

  it('should return empty array for non-existent standalone when sequence exists', () => {
    bindKey('cmd+k e', () => {});

    expect(getHandlers('cmd+k')).toEqual([]);
  });

  it('should work with multi-part sequences', () => {
    const handler = vi.fn();
    bindKey('cmd+k cmd+s cmd+w', handler);

    expect(getHandlers('cmd+k cmd+s cmd+w')).toContain(handler);
    expect(getHandlers('cmd+k cmd+s')).toEqual([]);
    expect(getHandlers('cmd+k')).toEqual([]);
  });
});
