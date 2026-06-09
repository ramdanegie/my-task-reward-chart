import { createHmac, randomInt } from 'node:crypto';

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function signChildToken(childId: string, secret: string): string {
  const sig = sign(childId, secret);
  return `${Buffer.from(childId).toString('base64url')}.${sig}`;
}

export function verifyChildToken(token: string, secret: string): string | null {
  const [encId, sig] = token.split('.');
  if (!encId || !sig) return null;
  const childId = Buffer.from(encId, 'base64url').toString('utf8');
  const expected = sign(childId, secret);
  if (sig.length !== expected.length) return null;
  // constant-time-ish compare
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? childId : null;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateAccessCode(): string {
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
