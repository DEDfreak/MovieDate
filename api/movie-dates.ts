import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enhanced data structure for linked dates and TV series support
interface MovieDate {
  id: number;
  movie_id: string;
  movie_title: string;
  movie_year?: string;
  movie_poster?: string;
  content_type: 'movie' | 'tv_series';
  date_watched: string;
  location: string;
  user1_id: string;
  user2_id: string;
  user1_rating?: number;
  user2_rating?: number;
  user1_review: string;
  user2_review: string;
  photos: any[];
  watch_status: 'completed' | 'partial' | 'continued';
  watch_progress: number; // 0-100 percentage
  parent_date_id?: number; // Link to previous incomplete date
  created_at: string;
  updated_at: string;
}

// For now, we'll use in-memory storage (later you can replace with a real database)
let movieDates: MovieDate[] = [];
let dateIdCounter = 1;

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      const { user1_id, user2_id, movie_id, watch_status, linked } = req.query;
      
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

      if (watch_status) {
        filteredDates = filteredDates.filter(date => 
          date.watch_status === watch_status
        );
      }

      // If requesting linked dates, include the linked dates array
      if (linked === 'true') {
        filteredDates = filteredDates.map(date => {
          const linkedDates = movieDates.filter(d => d.parent_date_id === date.id);
          const parentDate = date.parent_date_id ? movieDates.find(d => d.id === date.parent_date_id) : null;
          
          return {
            ...date,
            linked_dates: linkedDates,
            parent_date: parentDate
          };
        });
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
        content_type = 'movie',
        date_watched,
        location,
        user1_rating,
        user2_rating,
        user1_review,
        user2_review,
        photos = [],
        watch_status = 'completed',
        watch_progress = 100,
        parent_date_id
      } = req.body;

      // Basic validation
      if (!movie_id || !movie_title) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'movie_id and movie_title are required'
        });
      }

      // Validate watch_progress
      const progressValue = Math.max(0, Math.min(100, parseFloat(watch_progress) || 100));

      // Validate parent_date_id if provided
      if (parent_date_id) {
        const parentDate = movieDates.find(date => date.id === parseInt(parent_date_id));
        if (!parentDate) {
          return res.status(400).json({
            error: 'Invalid parent_date_id',
            message: 'Parent date not found'
          });
        }

        // Update parent date status to 'continued' if it was 'partial'
        if (parentDate.watch_status === 'partial') {
          parentDate.watch_status = 'continued';
          parentDate.updated_at = new Date().toISOString();
        }
      }

      // Create new movie date entry
      const newDate: MovieDate = {
        id: dateIdCounter++,
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        content_type: content_type as 'movie' | 'tv_series',
        date_watched: date_watched || new Date().toISOString(),
        location: location || '',
        user1_id: 'user1', // For now, hardcoded users (since no auth)
        user2_id: 'user2',
        user1_rating: user1_rating ? parseFloat(user1_rating) : undefined,
        user2_rating: user2_rating ? parseFloat(user2_rating) : undefined,
        user1_review: user1_review || '',
        user2_review: user2_review || '',
        photos: Array.isArray(photos) ? photos : [],
        watch_status: watch_status as 'completed' | 'partial' | 'continued',
        watch_progress: progressValue,
        parent_date_id: parent_date_id ? parseInt(parent_date_id) : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      movieDates.push(newDate);

      // Include linked dates in response
      const linkedDates = movieDates.filter(d => d.parent_date_id === newDate.id);
      const parentDate = newDate.parent_date_id ? movieDates.find(d => d.id === newDate.parent_date_id) : null;

      return res.status(201).json({
        message: 'Movie date created successfully',
        date: {
          ...newDate,
          linked_dates: linkedDates,
          parent_date: parentDate
        }
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
      const updatedDate: MovieDate = {
        ...movieDates[dateIndex],
        ...req.body,
        updated_at: new Date().toISOString()
      };

      // Validate watch_progress if provided
      if (req.body.watch_progress !== undefined) {
        updatedDate.watch_progress = Math.max(0, Math.min(100, parseFloat(req.body.watch_progress) || 100));
      }

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

      // Also delete any linked continuation dates
      const linkedDates = movieDates.filter(date => date.parent_date_id === deletedDate.id);
      linkedDates.forEach(linkedDate => {
        const linkedIndex = movieDates.findIndex(date => date.id === linkedDate.id);
        if (linkedIndex !== -1) {
          movieDates.splice(linkedIndex, 1);
        }
      });

      return res.status(200).json({
        message: 'Movie date deleted successfully',
        date: deletedDate,
        linked_dates_deleted: linkedDates.length
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
} 