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

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid IMDb ID parameter',
      message: 'Please provide a valid IMDb ID'
    });
  }

  try {
    // Hardcoded OMDB API key
    const apiKey = 'a47ebd1f';
    let apiUrl: string;
    
    if (apiKey) {
      // Use OMDB API for detailed movie info
      apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(id)}&plot=full`;
    } else {
      // Fallback to your current API (poster endpoint)
      apiUrl = `https://imdb.iamidiotareyoutoo.com/photo/${encodeURIComponent(id)}`;
    }

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      // @ts-ignore
      timeout: 10000,
    });

    if (!apiRes.ok) {
      throw new Error(`API responded with status: ${apiRes.status}`);
    }

    const data: any = await apiRes.json();

    // Handle OMDB response format
    if (apiKey && data?.Response === 'True') {
      const movieDetails = {
        imdbID: data.imdbID,
        title: data.Title,
        year: data.Year,
        rated: data.Rated,
        released: data.Released,
        runtime: data.Runtime,
        genre: data.Genre,
        director: data.Director,
        writer: data.Writer,
        actors: data.Actors,
        plot: data.Plot,
        language: data.Language,
        country: data.Country,
        awards: data.Awards,
        poster: data.Poster !== 'N/A' ? data.Poster : null,
        ratings: data.Ratings || [],
        metascore: data.Metascore,
        imdbRating: data.imdbRating,
        imdbVotes: data.imdbVotes,
        type: data.Type,
        boxOffice: data.BoxOffice,
        production: data.Production,
        website: data.Website
      };

      return res.status(200).json({
        movie: movieDetails,
        source: 'omdb'
      });
    } else if (data?.Response === 'False') {
      return res.status(404).json({
        error: 'Movie not found',
        message: data.Error || 'Movie not found in database'
      });
    } else {
      // Fallback API format (if using poster API)
      return res.status(200).json({
        movie: data,
        source: 'fallback'
      });
    }

  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Failed to fetch movie details', 
      details: error.message,
      imdbID: id
    });
  }
} 