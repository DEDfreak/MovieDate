import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql, { initSchema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await initSchema();

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { user_id, priority, is_shared } = req.query;

      let rows = await sql`SELECT * FROM wishlist_items ORDER BY added_date DESC`;

      if (user_id) {
        rows = rows.filter((r: any) => r.user_id === user_id || r.is_shared === true);
      }
      if (priority) {
        rows = rows.filter((r: any) => r.priority === priority);
      }
      if (is_shared !== undefined) {
        const shared = is_shared === 'true';
        rows = rows.filter((r: any) => r.is_shared === shared);
      }

      const priorityOrder: Record<string, number> = { must_watch: 3, interested: 2, maybe: 1 };
      rows.sort((a: any, b: any) => {
        const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        return diff !== 0 ? diff : new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
      });

      return res.status(200).json({ items: rows, total: rows.length });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const {
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        movie_genre,
        priority = 'interested',
        is_shared = false,
        user_id = 'user1',
      } = req.body;

      if (!movie_id || !movie_title) {
        return res.status(400).json({ error: 'movie_id and movie_title are required' });
      }

      const [existing] = await sql`
        SELECT id FROM wishlist_items
        WHERE movie_id = ${movie_id} AND (user_id = ${user_id} OR is_shared = true)
        LIMIT 1
      `;
      if (existing) {
        return res.status(409).json({ error: 'Movie already in wishlist', item: existing });
      }

      const [newItem] = await sql`
        INSERT INTO wishlist_items (movie_id, movie_title, movie_year, movie_poster, movie_genre, priority, is_shared, user_id)
        VALUES (${movie_id}, ${movie_title}, ${movie_year ?? null}, ${movie_poster ?? null}, ${movie_genre ?? null}, ${priority}, ${is_shared}, ${user_id})
        RETURNING *
      `;

      return res.status(201).json({ message: 'Movie added to wishlist successfully', item: newItem });
    }

    // ── PUT ──────────────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing item ID' });

      const existing = await sql`SELECT id FROM wishlist_items WHERE id = ${parseInt(id as string)}`;
      if (!existing.length) return res.status(404).json({ error: 'Item not found' });

      const body = req.body;
      const [updated] = await sql`
        UPDATE wishlist_items SET
          priority   = COALESCE(${body.priority    ?? null}, priority),
          is_shared  = COALESCE(${body.is_shared   != null ? body.is_shared   : null}, is_shared),
          movie_genre = COALESCE(${body.movie_genre ?? null}, movie_genre),
          updated_at = NOW()
        WHERE id = ${parseInt(id as string)}
        RETURNING *
      `;

      return res.status(200).json({ message: 'Wishlist item updated successfully', item: updated });
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing item ID' });

      const existing = await sql`SELECT * FROM wishlist_items WHERE id = ${parseInt(id as string)}`;
      if (!existing.length) return res.status(404).json({ error: 'Item not found' });

      await sql`DELETE FROM wishlist_items WHERE id = ${parseInt(id as string)}`;

      return res.status(200).json({ message: 'Movie removed from wishlist successfully', item: existing[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('wishlist error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
