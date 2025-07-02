import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fallback mock data for when external APIs fail
const mockMovieResults = [
  {
    title: "The Shawshank Redemption",
    year: "1994",
    poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
    imdbID: "tt0111161",
    type: "movie",
    Title: "The Shawshank Redemption",
    Year: "1994",
    Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg"
  },
  {
    title: "The Godfather",
    year: "1972",
    poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzUwOTI1Mzk@._V1_SX300.jpg",
    imdbID: "tt0068646",
    type: "movie",
    Title: "The Godfather",
    Year: "1972",
    Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzUwOTI1Mzk@._V1_SX300.jpg"
  }
];

const handler = async (req: VercelRequest, res: VercelResponse) => {
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

    // Use native fetch with AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`API responded with status: ${apiRes.status} ${apiRes.statusText}`);
    }

    const data: any = await apiRes.json();

    // Handle different response formats
    let results = [];
    let total = 0;

    if (apiKey && data?.Search) {
      // OMDB API format
      results = data.Search.map((movie: any) => ({
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster !== 'N/A' ? movie.Poster : null,
        imdbID: movie.imdbID,
        type: movie.Type,
        // Add these for compatibility
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster
      }));
      total = parseInt(data.totalResults) || results.length;
    } else if (data?.description && Array.isArray(data.description)) {
      // Your current API format
      results = data.description;
      total = results.length;
    } else if (data?.results && Array.isArray(data.results)) {
      // Alternative format
      results = data.results;
      total = results.length;
    } else if (Array.isArray(data)) {
      // Direct array response
      results = data;
      total = results.length;
    } else if (data?.Response === 'False') {
      // OMDB API error response
      return res.status(200).json({ 
        results: [],
        total: 0,
        query: q.trim(),
        message: data.Error || 'No movies found'
      });
    } else {
      results = [];
      total = 0;
    }

    return res.status(200).json({ 
      results,
      total,
      query: q.trim()
    });

  } catch (error: any) {
    console.error('Movie search API error:', error);
    
    // Fallback to mock data if external API fails
    const query = q.trim().toLowerCase();
    const filteredMockResults = mockMovieResults.filter(movie => 
      movie.title.toLowerCase().includes(query) ||
      movie.year.includes(query)
    );

    console.log(`Using fallback mock data for query: ${q}`);
    
    return res.status(200).json({ 
      results: filteredMockResults,
      total: filteredMockResults.length,
      query: q.trim(),
      fallback: true,
      message: 'Using sample data - external movie API temporarily unavailable'
    });
  }
};

export default handler; 