import type { VercelRequest, VercelResponse } from '@vercel/node';

// TMDb API configuration
const TMDB_API_KEY = '52551e2c1f1f7c12a23def4289f00195';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// OMDb API configuration
const OMDB_API_KEY = 'a47ebd1f';

interface PopularItem {
  id: string;
  title: string;
  year: string;
  poster?: string;
  content_type: 'movie' | 'tv_series';
  overview?: string;
  rating?: string;
  genre?: string;
}

// Fallback popular content
const fallbackPopular: PopularItem[] = [
  {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: '1994',
    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
    content_type: 'movie',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    rating: '9.3',
    genre: 'Drama'
  },
  {
    id: 'tv_1396',
    title: 'Breaking Bad',
    year: '2008',
    poster: 'https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
    content_type: 'tv_series',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    rating: '9.5',
    genre: 'Crime, Drama, Thriller'
  },
  {
    id: 'tv_66732',
    title: 'Stranger Things',
    year: '2016',
    poster: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
    content_type: 'tv_series',
    overview: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
    rating: '8.7',
    genre: 'Drama, Fantasy, Horror'
  },
  {
    id: 'tt0068646',
    title: 'The Godfather',
    year: '1972',
    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzUwNzE@._V1_SX300.jpg',
    content_type: 'movie',
    overview: 'The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.',
    rating: '9.2',
    genre: 'Crime, Drama'
  },
  {
    id: 'tv_1399',
    title: 'Game of Thrones',
    year: '2011',
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    content_type: 'tv_series',
    overview: 'Seven noble families fight for control of the mythical land of Westeros.',
    rating: '9.3',
    genre: 'Drama, Fantasy, Adventure'
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

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET method is supported'
    });
  }

  const { type = 'all', limit = 20 } = req.query;
  const limitNum = Math.min(parseInt(limit as string) || 20, 50);

  try {
    const results: PopularItem[] = [];

    // Fetch popular movies if requested
    if (type === 'all' || type === 'movie') {
      try {
        // For movies, we could use TMDb popular movies endpoint, but OMDb doesn't have a "popular" endpoint
        // So we'll use some well-known popular movies or TMDb popular endpoint
        const movieUrl = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const movieResponse = await fetch(movieUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          
          if (movieData.results && Array.isArray(movieData.results)) {
            const movieResults = movieData.results.slice(0, Math.floor(limitNum / 2)).map((movie: any) => ({
              id: movie.id.toString(),
              title: movie.title,
              year: movie.release_date ? movie.release_date.split('-')[0] : '',
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
              content_type: 'movie' as const,
              overview: movie.overview,
              rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
              genre: 'Movie'
            }));
            results.push(...movieResults);
          }
        }
      } catch (error) {
        console.error('TMDb movies error:', error);
      }
    }

    // Fetch popular TV series if requested
    if (type === 'all' || type === 'tv_series') {
      try {
        const tvUrl = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=1`;
        
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
            const tvResults = tvData.results.slice(0, Math.floor(limitNum / 2)).map((show: any) => ({
              id: `tv_${show.id}`,
              title: show.name,
              year: show.first_air_date ? show.first_air_date.split('-')[0] : '',
              poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
              content_type: 'tv_series' as const,
              overview: show.overview,
              rating: show.vote_average ? show.vote_average.toFixed(1) : undefined,
              genre: 'TV Series'
            }));
            results.push(...tvResults);
          }
        }
      } catch (error) {
        console.error('TMDb TV error:', error);
      }
    }

    // If no results from APIs, use fallback data
    if (results.length === 0) {
      const fallbackResults = fallbackPopular.filter(item => {
        return type === 'all' || item.content_type === type;
      }).slice(0, limitNum);
      
      results.push(...fallbackResults);
    }

    // Shuffle and limit results
    const shuffledResults = results
      .sort(() => Math.random() - 0.5)
      .slice(0, limitNum);

    return res.status(200).json({
      popular: shuffledResults,
      total: shuffledResults.length,
      type: type,
      fallback: results.length === 0 || results.some(r => fallbackPopular.includes(r as any))
    });

  } catch (error: any) {
    console.error('Popular content error:', error);
    
    // Fallback to sample data
    const fallbackResults = fallbackPopular.filter(item => {
      return type === 'all' || item.content_type === type;
    }).slice(0, limitNum);

    return res.status(200).json({
      popular: fallbackResults,
      total: fallbackResults.length,
      type: type,
      fallback: true,
      message: 'Using sample data - external APIs temporarily unavailable'
    });
  }
} 