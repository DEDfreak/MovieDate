import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter: q' });
  }

  try {
    const apiRes = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(q)}`);
    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch movie data' });
  }
} 