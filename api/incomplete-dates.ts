import type { VercelRequest, VercelResponse } from '@vercel/node';
import sql, { initSchema } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initSchema();

  try {
    const rows = await sql`
      SELECT * FROM movie_dates
      WHERE watch_status = 'partial'
      ORDER BY date_watched DESC
    `;

    const incompleteDates = rows.map((row: any) => ({
      id: row.id,
      movie_id: row.movie_id,
      movie_title: row.movie_title,
      movie_year: row.movie_year,
      movie_poster: row.movie_poster,
      content_type: row.content_type,
      date_watched: row.date_watched,
      location: row.location,
      watch_progress: row.watch_progress,
      formatted_date: new Date(row.date_watched).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      days_ago: Math.floor(
        (Date.now() - new Date(row.date_watched).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return res.status(200).json({
      incomplete_dates: incompleteDates,
      total: incompleteDates.length,
      message: incompleteDates.length === 0 ? 'No incomplete dates found' : undefined,
    });

  } catch (error: any) {
    console.error('incomplete-dates error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
