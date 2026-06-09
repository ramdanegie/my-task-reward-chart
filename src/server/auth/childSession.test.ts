import { describe, it, expect } from 'vitest';
import { signChildToken, verifyChildToken, generateAccessCode } from './childSession';

const SECRET = 'test-secret';

describe('childSession', () => {
  it('signs and verifies a child token', () => {
    const token = signChildToken('child-123', SECRET);
    expect(verifyChildToken(token, SECRET)).toBe('child-123');
  });

  it('rejects a tampered token', () => {
    const token = signChildToken('child-123', SECRET);
    expect(verifyChildToken(token + 'x', SECRET)).toBeNull();
    expect(verifyChildToken(token, 'other-secret')).toBeNull();
  });

  it('generates a 6-char uppercase access code', () => {
    const code = generateAccessCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });
});
