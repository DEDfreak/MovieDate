import type { VercelRequest, VercelResponse } from '@vercel/node';

// TMDb API configuration
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // You'll need to get this from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// OMDb API configuration
const OMDB_API_KEY = 'a47ebd1f';

interface SearchResult {
  id: string;
  title: string;
  year: string;
  poster?: string;
  content_type: 'movie' | 'tv_series';
  overview?: string;
  genre?: string;
  imdb_id?: string;
  tmdb_id?: string;
}

// Fallback data when APIs are unavailable
const fallbackContent: SearchResult[] = [
  {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: '1994',
    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
    content_type: 'movie',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    genre: 'Drama',
    imdb_id: 'tt0111161'
  },
  {
    id: 'tv_breaking_bad',
    title: 'Breaking Bad',
    year: '2008',
    poster: 'https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
    content_type: 'tv_series',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    genre: 'Crime, Drama, Thriller',
    tmdb_id: '1396'
  },
  {
    id: 'tv_stranger_things',
    title: 'Stranger Things',
    year: '2016',
    poster: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    content_type: 'tv_series',
    overview: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
    genre: 'Drama, Fantasy, Horror',
    tmdb_id: '66732'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, type = 'all' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({
      error: 'Missing or invalid query parameter: q',
      message: 'Please provide a valid search query'
    });
  }

  try {
    const results: SearchResult[] = [];
    const query = q.trim();

    // Search movies using OMDb if type includes movies
    if (type === 'all' || type === 'movie') {
      try {
        const movieUrl = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const movieResponse = await fetch(movieUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          
          if (movieData.Search && Array.isArray(movieData.Search)) {
            const movieResults = movieData.Search.map((movie: any) => ({
              id: movie.imdbID,
              title: movie.Title,
              year: movie.Year,
              poster: movie.Poster !== 'N/A' ? movie.Poster : undefined,
              content_type: 'movie' as const,
              imdb_id: movie.imdbID
            }));
            results.push(...movieResults);
          }
        }
      } catch (error) {
        console.error('OMDb API error:', error);
      }
    }

    // Search TV series using TMDb if type includes TV
    if (type === 'all' || type === 'tv_series') {
      try {
        // For demo purposes, we'll use fallback TV data since TMDb requires API key setup
        const tvFallback = fallbackContent.filter(item => 
          item.content_type === 'tv_series' && 
          item.title.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...tvFallback);

        /* 
        // Uncomment and use this when you have TMDb API key:
        
        const tvUrl = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const tvResponse = await fetch(tvUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (tvResponse.ok) {
          const tvData = await tvResponse.json();
          
          if (tvData.results && Array.isArray(tvData.results)) {
            const tvResults = tvData.results.slice(0, 10).map((show: any) => ({
              id: `tv_${show.id}`,
              title: show.name,
              year: show.first_air_date ? show.first_air_date.split('-')[0] : '',
              poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
              content_type: 'tv_series' as const,
              overview: show.overview,
              tmdb_id: show.id.toString()
            }));
            results.push(...tvResults);
          }
        }
        */
      } catch (error) {
        console.error('TMDb API error:', error);
      }
    }

    // If no results from APIs, use filtered fallback data
    if (results.length === 0) {
      const fallbackResults = fallbackContent.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                           item.year.includes(query);
        const matchesType = type === 'all' || item.content_type === type;
        return matchesQuery && matchesType;
      });
      
      results.push(...fallbackResults);
    }

    // Sort results: movies first, then TV series, then by relevance
    results.sort((a, b) => {
      if (a.content_type !== b.content_type) {
        return a.content_type === 'movie' ? -1 : 1;
      }
      return a.title.toLowerCase().indexOf(query.toLowerCase()) - 
             b.title.toLowerCase().indexOf(query.toLowerCase());
    });

    return res.status(200).json({
      results: results.slice(0, 20), // Limit to 20 results
      total: results.length,
      query: query,
      type: type,
      fallback: results.some(r => fallbackContent.includes(r))
    });

  } catch (error: any) {
    console.error('Content search error:', error);
    
    // Fallback to sample data
    const fallbackResults = fallbackContent.filter(item => {
      const matchesQuery = item.title.toLowerCase().includes(q.trim().toLowerCase()) ||
                         item.year.includes(q.trim());
      const matchesType = type === 'all' || item.content_type === type;
      return matchesQuery && matchesType;
    });

    return res.status(200).json({
      results: fallbackResults,
      total: fallbackResults.length,
      query: q.trim(),
      type: type,
      fallback: true,
      message: 'Using sample data - external APIs temporarily unavailable'
    });
  }
} 