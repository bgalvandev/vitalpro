import { describe, expect, it } from 'vitest';

import { createHealthRecordSeed } from './index';

describe('createHealthRecordSeed', () => {
  it('creates deterministic identifiers', () => {
    expect(createHealthRecordSeed('123')).toBe('health-record:123');
  });
});
