import type { VercelRequest, VercelResponse } from '@vercel/node';

// TMDb API configuration
const TMDB_API_KEY = '52551e2c1f1f7c12a23def4289f00195';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
      error: 'Missing or invalid TMDb ID parameter',
      message: 'Please provide a valid TMDb TV series ID'
    });
  }

  try {
    // Extract TMDb ID from the formatted ID (remove 'tv_' prefix if present)
    const tmdbId = id.startsWith('tv_') ? id.substring(3) : id;
    
    // Use TMDb API for detailed TV series info
    const apiUrl = `${TMDB_BASE_URL}/tv/${encodeURIComponent(tmdbId)}?api_key=${TMDB_API_KEY}&append_to_response=credits`;

    // Use native fetch with AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`TMDb API responded with status: ${apiRes.status} ${apiRes.statusText}`);
    }

    const data: any = await apiRes.json();

    // Transform TMDb response to match our expected format
    const tvDetails = {
      tmdbID: data.id,
      title: data.name,
      year: data.first_air_date ? data.first_air_date.split('-')[0] : '',
      rated: '', // TMDb doesn't provide content rating in the same format
      released: data.first_air_date,
      runtime: data.episode_run_time?.length > 0 ? `${data.episode_run_time[0]} min/episode` : '',
      genre: data.genres?.map((g: any) => g.name).join(', ') || '',
      director: '', // TV series don't have directors in the same way
      creator: data.created_by?.map((c: any) => c.name).join(', ') || '',
      actors: data.credits?.cast?.slice(0, 5).map((actor: any) => actor.name).join(', ') || '',
      plot: data.overview || '',
      overview: data.overview || '',
      language: data.original_language?.toUpperCase() || '',
      country: data.origin_country?.join(', ') || '',
      awards: '', // TMDb doesn't provide awards info
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      ratings: [], // TMDb has vote_average, but different format than OMDb
      tmdbRating: data.vote_average ? data.vote_average.toFixed(1) : '',
      tmdbVotes: data.vote_count || 0,
      type: 'series',
      numberOfSeasons: data.number_of_seasons || 0,
      numberOfEpisodes: data.number_of_episodes || 0,
      status: data.status || '',
      networks: data.networks?.map((n: any) => n.name).join(', ') || '',
      lastAirDate: data.last_air_date || '',
      homepage: data.homepage || ''
    };

    return res.status(200).json({
      series: tvDetails,
      source: 'tmdb'
    });

  } catch (error: any) {
    console.error('TV series details API error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout', 
        message: 'The TV series details request timed out. Please try again.',
        tmdbID: id
      });
    }

    if (error.message.includes('404')) {
      return res.status(404).json({
        error: 'TV series not found',
        message: 'TV series not found in TMDb database',
        tmdbID: id
      });
    }

    return res.status(500).json({ 
      error: 'Failed to fetch TV series details', 
      message: error.message || 'An unexpected error occurred',
      tmdbID: id
    });
  }
} 