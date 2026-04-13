import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import sql, { initSchema } from './_db';
import { signToken } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  await initSchema();

  const { action, username, password, display_name } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // ── REGISTER ───────────────────────────────────────────────────────────────
  if (action === 'register') {
    const existing = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
    if (existing.length) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [user] = await sql`
      INSERT INTO users (username, password_hash, display_name)
      VALUES (${username}, ${hash}, ${display_name || username})
      RETURNING id, username, display_name, created_at
    `;

    const token = signToken({ userId: user.id, username: user.username });
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, username: user.username, display_name: user.display_name },
    });
  }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (action === 'login') {
    const [user] = await sql`
      SELECT id, username, password_hash, display_name FROM users WHERE username = ${username} LIMIT 1
    `;

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, username: user.username, display_name: user.display_name },
    });
  }

  return res.status(400).json({ error: 'action must be "login" or "register"' });
}
