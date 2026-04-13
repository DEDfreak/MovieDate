import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  username: string;
}

/** Sign a JWT that expires in 7 days. */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

/** Verify a token and return the payload, or null if invalid/missing. */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify the Bearer token from the Authorization header.
 * Returns the payload on success, or sends a 401 and returns null.
 */
export function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): JwtPayload | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    return null;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token is invalid or expired' });
    return null;
  }
  return payload;
}
