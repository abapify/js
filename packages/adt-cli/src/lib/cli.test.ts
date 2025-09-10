import { describe, it, expect } from 'vitest';
import { createCLI } from './cli';

describe('ADT CLI', () => {
  it('should create CLI program', () => {
    const program = createCLI();
    expect(program).toBeDefined();
    expect(program.name()).toBe('adt');
  });
});
