import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  // Better validation
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Missing or invalid query parameter: q',
      message: 'Please provide a valid search query'
    });
  }

  try {
    // Hardcoded OMDB API key
    const apiKey = 'a47ebd1f';
    let apiUrl: string;
    if (apiKey) {
      // Use OMDB API if key is available
      apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(q.trim())}&type=movie`;
    } else {
      // Fallback to your current API
      apiUrl = `https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(q.trim())}`;
    }

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      // @ts-ignore
      timeout: 10000, // 10 second timeout
    });

    if (!apiRes.ok) {
      throw new Error(`API responded with status: ${apiRes.status}`);
    }

    const data: any = await apiRes.json();
    // Debug: log the data structure
    // console.log('API Response:', JSON.stringify(data, null, 2));

    // Handle different response formats
    let results = [];
    if (apiKey && data?.Search) {
      // OMDB API format
      results = data.Search.map((movie: any) => ({
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster !== 'N/A' ? movie.Poster : null,
        imdbID: movie.imdbID,
        type: movie.Type
      }));
    } else if (data?.description && Array.isArray(data.description)) {
      // Your current API format
      results = data.description;
    } else if (data?.results && Array.isArray(data.results)) {
      // Alternative format
      results = data.results;
    } else if (Array.isArray(data)) {
      // Direct array response
      results = data;
    } else {
      results = [];
    }

    // Add debug info to the response for troubleshooting
    return res.status(200).json({ 
      results,
      total: results.length,
      query: q.trim(),
      debug: { raw: data }
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Failed to fetch movie data', 
      details: error.message,
      query: q
    });
  }
} 