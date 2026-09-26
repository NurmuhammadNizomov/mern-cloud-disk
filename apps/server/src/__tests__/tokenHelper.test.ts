import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../utils/tokenHelper';

describe('tokenHelper utility', () => {
  const userId = '654321654321654321654321';
  const email = 'test@disk.com';

  it('Generates and verifies access token successfully', () => {
    const token = generateAccessToken(userId, email);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(userId);
    expect(decoded.email).toBe(email);
  });

  it('Generates and verifies refresh token successfully', () => {
    const token = generateRefreshToken(userId, email);
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(userId);
    expect(decoded.email).toBe(email);
  });

  it('Throws error on invalid token', () => {
    expect(() => verifyAccessToken('invalid_token_string')).toThrow();
  });
});
