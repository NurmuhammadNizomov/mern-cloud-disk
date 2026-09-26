import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../utils/tokenHelper';

describe('tokenHelper utility', () => {
  const userId = '654321654321654321654321';
  const email = 'test@disk.uz';

  it('Access tokenni muvaffaqiyatli yaratadi va tekshiradi', () => {
    const token = generateAccessToken(userId, email);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(userId);
    expect(decoded.email).toBe(email);
  });

  it('Refresh tokenni muvaffaqiyatli yaratadi va tekshiradi', () => {
    const token = generateRefreshToken(userId, email);
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(userId);
    expect(decoded.email).toBe(email);
  });

  it('Yaroqsiz tokenda xatolik chiqaradi', () => {
    expect(() => verifyAccessToken('invalid_token_string')).toThrow();
  });
});
