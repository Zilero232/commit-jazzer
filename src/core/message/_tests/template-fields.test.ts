import { describe, expect, it } from 'vitest';

import { DEFAULT_TEMPLATE } from '../../config';
import { templateFields } from '../template-fields';

describe('templateFields', () => {
  it('finds every field in the default template', () => {
    expect([...templateFields(DEFAULT_TEMPLATE)].sort()).toEqual([
      'breaking',
      'comment',
      'component',
      'description',
      'issues',
      'title',
      'type'
    ]);
  });

  it('counts derived variables and block helpers', () => {
    expect([...templateFields('{{type}}{{scope}}{{bang}}: {{title}}{{#if issues}} x{{/if}}')].sort()).toEqual([
      'breaking',
      'component',
      'issues',
      'title',
      'type'
    ]);
  });

  it('reads variables with whitespace control and #each blocks', () => {
    expect([...templateFields('{{~type~}}: {{~ title}}{{#each issues}}x{{/each}}')].sort()).toEqual([
      'issues',
      'title',
      'type'
    ]);
  });

  it('leaves out what the 1.x template does not write', () => {
    expect([...templateFields('{{type}}: {{emoji}} - {{title}}')].sort()).toEqual(['title', 'type']);
  });
});
