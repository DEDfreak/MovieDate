import type { VercelRequest, VercelResponse } from '@vercel/node';

// For now, we'll use in-memory storage (later you can replace with a real database)
let movieDates: any[] = [];
let dateIdCounter = 1;

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all movie dates or filter by query params
      const { user1_id, user2_id, movie_id } = req.query;
      
      let filteredDates = [...movieDates];
      
      if (user1_id) {
        filteredDates = filteredDates.filter(date => 
          date.user1_id === user1_id || date.user2_id === user1_id
        );
      }
      
      if (movie_id) {
        filteredDates = filteredDates.filter(date => 
          date.movie_id === movie_id
        );
      }

      return res.status(200).json({
        dates: filteredDates,
        total: filteredDates.length
      });
    }

    if (req.method === 'POST') {
      // Create new movie date
      const {
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        date_watched,
        location,
        user1_rating,
        user2_rating,
        user1_review,
        user2_review,
        photos = []
      } = req.body;

      // Basic validation
      if (!movie_id || !movie_title) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'movie_id and movie_title are required'
        });
      }

      // Create new movie date entry
      const newDate = {
        id: dateIdCounter++,
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        date_watched: date_watched || new Date().toISOString(),
        location: location || '',
        user1_id: 'user1', // For now, hardcoded users (since no auth)
        user2_id: 'user2',
        user1_rating: user1_rating ? parseFloat(user1_rating) : null,
        user2_rating: user2_rating ? parseFloat(user2_rating) : null,
        user1_review: user1_review || '',
        user2_review: user2_review || '',
        photos: Array.isArray(photos) ? photos : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      movieDates.push(newDate);

      return res.status(201).json({
        message: 'Movie date created successfully',
        date: newDate
      });
    }

    if (req.method === 'PUT') {
      // Update existing movie date
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing date ID',
          message: 'Please provide a date ID to update'
        });
      }

      const dateIndex = movieDates.findIndex(date => date.id === parseInt(id as string));
      
      if (dateIndex === -1) {
        return res.status(404).json({
          error: 'Date not found',
          message: 'No movie date found with the provided ID'
        });
      }

      // Update the date with new data
      const updatedDate = {
        ...movieDates[dateIndex],
        ...req.body,
        updated_at: new Date().toISOString()
      };

      movieDates[dateIndex] = updatedDate;

      return res.status(200).json({
        message: 'Movie date updated successfully',
        date: updatedDate
      });
    }

    if (req.method === 'DELETE') {
      // Delete movie date
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing date ID',
          message: 'Please provide a date ID to delete'
        });
      }

      const dateIndex = movieDates.findIndex(date => date.id === parseInt(id as string));
      
      if (dateIndex === -1) {
        return res.status(404).json({
          error: 'Date not found',
          message: 'No movie date found with the provided ID'
        });
      }

      const deletedDate = movieDates.splice(dateIndex, 1)[0];

      return res.status(200).json({
        message: 'Movie date deleted successfully',
        date: deletedDate
      });
    }

    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET, POST, PUT, and DELETE methods are supported'
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

export default handler; 