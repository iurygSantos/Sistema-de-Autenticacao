import jwt from 'jsonwebtoken';
import { Role } from '@/contexts/AuthContext';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-secret-refresh-key';

export interface AccessTokenPayload {
  userId: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
