import { describe, expect, it } from 'vitest';

import { createStartupMessage } from './main';

describe('createStartupMessage', () => {
  it('includes bootstrap marker', () => {
    expect(createStartupMessage()).toContain('bootstrapped');
  });
});
