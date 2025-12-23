import { describe, it, expect } from 'vitest';
import { createCLI } from './cli';

describe('ADT CLI', () => {
  it('should create CLI program', async () => {
    const program = await createCLI();
    expect(program).toBeDefined();
    expect(program.name()).toBe('adt');
  });
});
