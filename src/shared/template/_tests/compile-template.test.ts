import { describe, expect, it } from 'vitest';

import { compileTemplate } from '../compile-template';

describe('compileTemplate', () => {
  it('compiles a template once', () => {
    expect(compileTemplate('{{a}}')).toBe(compileTemplate('{{a}}'));
  });

  it('renders values as typed, without HTML escaping', () => {
    expect(compileTemplate('{{a}}')({ a: '<b> & "c"' })).toBe('<b> & "c"');
  });

  it('cannot reach prototype properties', () => {
    expect(compileTemplate('{{constructor.name}}{{__proto__}}')({})).toBe('');
  });
});
