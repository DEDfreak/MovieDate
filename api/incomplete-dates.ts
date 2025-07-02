import type { VercelRequest, VercelResponse } from '@vercel/node';

// This would normally connect to your database
// For now, we'll import from the movie-dates file (in production, use shared database)
// Since we can't import directly, we'll create a simple endpoint that works with the movie-dates API

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

  try {
    // In a real app, you'd query your database directly
    // For now, we'll make an internal API call to get partial dates
    const { user_id } = req.query;
    
    // Construct the internal API URL
    const baseUrl = req.headers.host?.includes('localhost') 
      ? `http://${req.headers.host}` 
      : `https://${req.headers.host}`;
    
    const apiUrl = `${baseUrl}/api/movie-dates?watch_status=partial&linked=true`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter and format incomplete dates for linking
        const incompleteDates = data.dates
          .filter((date: any) => date.watch_status === 'partial')
          .map((date: any) => ({
            id: date.id,
            movie_id: date.movie_id,
            movie_title: date.movie_title,
            movie_year: date.movie_year,
            movie_poster: date.movie_poster,
            content_type: date.content_type,
            date_watched: date.date_watched,
            location: date.location,
            watch_progress: date.watch_progress,
            formatted_date: new Date(date.date_watched).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            days_ago: Math.floor((Date.now() - new Date(date.date_watched).getTime()) / (1000 * 60 * 60 * 24))
          }))
          .sort((a: any, b: any) => new Date(b.date_watched).getTime() - new Date(a.date_watched).getTime()); // Most recent first

        return res.status(200).json({
          incomplete_dates: incompleteDates,
          total: incompleteDates.length,
          message: incompleteDates.length === 0 ? 'No incomplete dates found' : undefined
        });
      } else {
        throw new Error('Failed to fetch movie dates');
      }
    } catch (fetchError) {
      // Fallback: return sample incomplete dates for demo
      const sampleIncompleteDates = [
        {
          id: 1,
          movie_id: 'tv_stranger_things',
          movie_title: 'Stranger Things',
          movie_year: '2016',
          movie_poster: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg',
          content_type: 'tv_series',
          date_watched: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          location: 'Living Room',
          watch_progress: 60,
          formatted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          days_ago: 7
        },
        {
          id: 2,
          movie_id: 'tv_breaking_bad',
          movie_title: 'Breaking Bad',
          movie_year: '2008',
          movie_poster: 'https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
          content_type: 'tv_series',
          date_watched: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
          location: 'Bedroom',
          watch_progress: 35,
          formatted_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          days_ago: 14
        }
      ];

      return res.status(200).json({
        incomplete_dates: sampleIncompleteDates,
        total: sampleIncompleteDates.length,
        fallback: true,
        message: 'Using sample data - showing example incomplete dates'
      });
    }

  } catch (error: any) {
    console.error('Incomplete dates API error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
} 