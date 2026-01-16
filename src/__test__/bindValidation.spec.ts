import { afterEach, describe, expect, it } from 'vitest';
import { bindKey, unbindAll } from '../index';

describe('binding validation for conflicting shortcuts', () => {
  afterEach(() => {
    unbindAll();
  });

  it('should throw when binding standalone that conflicts with existing sequence start', () => {
    bindKey('cmd+k e', () => {});

    // cmd+k standalone conflicts with cmd+k e sequence
    expect(() => bindKey('cmd+k', () => {})).toThrow();
  });

  it('should throw when binding sequence that conflicts with existing standalone', () => {
    bindKey('cmd+k', () => {});

    // cmd+k e sequence conflicts with cmd+k standalone
    expect(() => bindKey('cmd+k e', () => {})).toThrow();
  });

  it('should not throw for non-conflicting bindings', () => {
    bindKey('cmd+k e', () => {});

    // Different key entirely
    expect(() => bindKey('cmd+j', () => {})).not.toThrow();
    // Different sequence with same start (both are sequences)
    expect(() => bindKey('cmd+k o', () => {})).not.toThrow();
  });

  it('should not throw for same sequence bound multiple times with different handlers', () => {
    bindKey('g i', () => {});

    // Same sequence, different handler - this is allowed
    expect(() => bindKey('g i', () => {})).not.toThrow();
  });

  it('should throw with simple key sequences', () => {
    bindKey('g i', () => {});

    // g standalone conflicts with g i sequence
    expect(() => bindKey('g', () => {})).toThrow();
  });

  it('should throw when binding sequence after standalone with simple keys', () => {
    bindKey('g', () => {});

    // g i sequence conflicts with g standalone
    expect(() => bindKey('g i', () => {})).toThrow();
  });

  it('should throw with multi-part sequences', () => {
    bindKey('cmd+k cmd+s cmd+w', () => {});

    // cmd+k standalone conflicts
    expect(() => bindKey('cmd+k', () => {})).toThrow();
  });

  it('should work correctly across different scopes', () => {
    bindKey('cmd+k e', 'editor', () => {});

    // Same key in different scope should NOT conflict
    expect(() => bindKey('cmd+k', 'global', () => {})).not.toThrow();
    // Same key in same scope SHOULD conflict
    expect(() => bindKey('cmd+k', 'editor', () => {})).toThrow();
  });
});
