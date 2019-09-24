import { bindKey, unbindAll, DEFAULT_SCOPE } from '../index';

describe('throwing error in development', () => {
  const { NODE_ENV } = process.env;
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });
  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
    unbindAll();
  });
  it('should not throw error if skipOther single', () => {
    const fn = jest.fn();
    bindKey('e', DEFAULT_SCOPE, fn);
    expect(() =>
      bindKey('e', DEFAULT_SCOPE, fn, { skipOther: true })
    ).not.toThrow();
  });
  it('should not throw error if skipOther single', () => {
    const fn = jest.fn();
    bindKey('e', DEFAULT_SCOPE, fn, { skipOther: true });
    expect(() => bindKey('e', DEFAULT_SCOPE, fn)).not.toThrow();
  });
  it('should throw error on using skipOthers twice', () => {
    const fn = jest.fn();
    bindKey('e', DEFAULT_SCOPE, fn, { skipOther: true });
    expect(() =>
      bindKey('e', DEFAULT_SCOPE, fn, { skipOther: true })
    ).toThrow();
  });
});
