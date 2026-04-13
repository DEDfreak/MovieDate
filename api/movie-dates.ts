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
      const { user1_id, user2_id, movie_id, watch_status, linked } = req.query;

      let rows = await sql`SELECT * FROM movie_dates ORDER BY date_watched DESC`;

      if (user1_id) {
        rows = rows.filter((r: any) => r.user1_id === user1_id || r.user2_id === user1_id);
      }
      if (user2_id) {
        rows = rows.filter((r: any) => r.user1_id === user2_id || r.user2_id === user2_id);
      }
      if (movie_id) {
        rows = rows.filter((r: any) => r.movie_id === movie_id);
      }
      if (watch_status) {
        rows = rows.filter((r: any) => r.watch_status === watch_status);
      }

      if (linked === 'true') {
        const allRows = await sql`SELECT * FROM movie_dates`;
        rows = rows.map((row: any) => ({
          ...row,
          linked_dates: allRows.filter((r: any) => r.parent_date_id === row.id),
          parent_date: row.parent_date_id
            ? allRows.find((r: any) => r.id === row.parent_date_id) ?? null
            : null,
        }));
      }

      return res.status(200).json({ dates: rows, total: rows.length });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const {
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        content_type = 'movie',
        date_watched,
        location,
        user1_rating,
        user2_rating,
        user1_review,
        user2_review,
        photos = [],
        watch_status = 'completed',
        watch_progress = 100,
        parent_date_id,
      } = req.body;

      if (!movie_id || !movie_title) {
        return res.status(400).json({ error: 'movie_id and movie_title are required' });
      }

      const progress = Math.max(0, Math.min(100, parseFloat(watch_progress) || 100));

      // Validate parent and flip its status to 'continued' if it was 'partial'
      if (parent_date_id) {
        const [parent] = await sql`SELECT id, watch_status FROM movie_dates WHERE id = ${parseInt(parent_date_id)}`;
        if (!parent) {
          return res.status(400).json({ error: 'Parent date not found' });
        }
        if (parent.watch_status === 'partial') {
          await sql`
            UPDATE movie_dates
            SET watch_status = 'continued', updated_at = NOW()
            WHERE id = ${parent.id}
          `;
        }
      }

      const [newDate] = await sql`
        INSERT INTO movie_dates (
          movie_id, movie_title, movie_year, movie_poster, content_type,
          date_watched, location,
          user1_id, user2_id,
          user1_rating, user2_rating,
          user1_review, user2_review,
          photos, watch_status, watch_progress, parent_date_id
        ) VALUES (
          ${movie_id}, ${movie_title}, ${movie_year ?? null}, ${movie_poster ?? null}, ${content_type},
          ${date_watched ?? new Date().toISOString()}, ${location ?? ''},
          'user1', 'user2',
          ${user1_rating != null ? parseFloat(user1_rating) : null},
          ${user2_rating != null ? parseFloat(user2_rating) : null},
          ${user1_review ?? ''}, ${user2_review ?? ''},
          ${JSON.stringify(Array.isArray(photos) ? photos : [])},
          ${watch_status}, ${progress},
          ${parent_date_id ? parseInt(parent_date_id) : null}
        )
        RETURNING *
      `;

      return res.status(201).json({
        message: 'Movie date created successfully',
        date: { ...newDate, linked_dates: [], parent_date: null },
      });
    }

    // ── PUT ──────────────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing date ID' });

      const existing = await sql`SELECT * FROM movie_dates WHERE id = ${parseInt(id as string)}`;
      if (!existing.length) return res.status(404).json({ error: 'Date not found' });

      const body = req.body;
      if (body.watch_progress !== undefined) {
        body.watch_progress = Math.max(0, Math.min(100, parseFloat(body.watch_progress) || 100));
      }

      const [updated] = await sql`
        UPDATE movie_dates SET
          movie_id       = COALESCE(${body.movie_id        ?? null}, movie_id),
          movie_title    = COALESCE(${body.movie_title     ?? null}, movie_title),
          movie_year     = COALESCE(${body.movie_year      ?? null}, movie_year),
          movie_poster   = COALESCE(${body.movie_poster    ?? null}, movie_poster),
          content_type   = COALESCE(${body.content_type    ?? null}, content_type),
          date_watched   = COALESCE(${body.date_watched    ?? null}, date_watched),
          location       = COALESCE(${body.location        ?? null}, location),
          user1_rating   = COALESCE(${body.user1_rating    != null ? parseFloat(body.user1_rating)   : null}, user1_rating),
          user2_rating   = COALESCE(${body.user2_rating    != null ? parseFloat(body.user2_rating)   : null}, user2_rating),
          user1_review   = COALESCE(${body.user1_review    ?? null}, user1_review),
          user2_review   = COALESCE(${body.user2_review    ?? null}, user2_review),
          photos         = COALESCE(${body.photos          != null ? JSON.stringify(body.photos)      : null}::jsonb, photos),
          watch_status   = COALESCE(${body.watch_status    ?? null}, watch_status),
          watch_progress = COALESCE(${body.watch_progress  != null ? body.watch_progress             : null}, watch_progress),
          updated_at     = NOW()
        WHERE id = ${parseInt(id as string)}
        RETURNING *
      `;

      return res.status(200).json({ message: 'Movie date updated successfully', date: updated });
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing date ID' });

      const numId = parseInt(id as string);
      const existing = await sql`SELECT * FROM movie_dates WHERE id = ${numId}`;
      if (!existing.length) return res.status(404).json({ error: 'Date not found' });

      // Cascade delete linked continuation dates first
      const linked = await sql`SELECT id FROM movie_dates WHERE parent_date_id = ${numId}`;
      if (linked.length) {
        await sql`DELETE FROM movie_dates WHERE parent_date_id = ${numId}`;
      }

      await sql`DELETE FROM movie_dates WHERE id = ${numId}`;

      return res.status(200).json({
        message: 'Movie date deleted successfully',
        date: existing[0],
        linked_dates_deleted: linked.length,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('movie-dates error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
