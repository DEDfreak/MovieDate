import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for wishlist items
let wishlistItems: any[] = [];
let wishlistIdCounter = 1;

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
      // Get wishlist items with optional filtering
      const { user_id, priority, is_shared } = req.query;
      
      let filteredItems = [...wishlistItems];
      
      if (user_id) {
        filteredItems = filteredItems.filter(item => 
          item.user_id === user_id || item.is_shared === true
        );
      }
      
      if (priority) {
        filteredItems = filteredItems.filter(item => 
          item.priority === priority
        );
      }
      
      if (is_shared !== undefined) {
        const isShared = is_shared === 'true';
        filteredItems = filteredItems.filter(item => 
          item.is_shared === isShared
        );
      }

      // Sort by priority (must_watch > interested > maybe) and then by added_date
      const priorityOrder = { 'must_watch': 3, 'interested': 2, 'maybe': 1 };
      filteredItems.sort((a, b) => {
        const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
      });

      return res.status(200).json({
        items: filteredItems,
        total: filteredItems.length
      });
    }

    if (req.method === 'POST') {
      // Add movie to wishlist
      const {
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        movie_genre,
        priority = 'interested',
        is_shared = false,
        user_id = 'user1'
      } = req.body;

      // Basic validation
      if (!movie_id || !movie_title) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'movie_id and movie_title are required'
        });
      }

      // Check if movie already exists in wishlist
      const existingItem = wishlistItems.find(item => 
        item.movie_id === movie_id && 
        (item.user_id === user_id || item.is_shared)
      );

      if (existingItem) {
        return res.status(409).json({
          error: 'Movie already in wishlist',
          message: 'This movie is already in the wishlist',
          item: existingItem
        });
      }

      // Create new wishlist item
      const newItem = {
        id: wishlistIdCounter++,
        movie_id,
        movie_title,
        movie_year,
        movie_poster,
        movie_genre,
        priority, // must_watch, interested, maybe
        is_shared,
        user_id,
        added_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      wishlistItems.push(newItem);

      return res.status(201).json({
        message: 'Movie added to wishlist successfully',
        item: newItem
      });
    }

    if (req.method === 'PUT') {
      // Update wishlist item (e.g., change priority)
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing item ID',
          message: 'Please provide a wishlist item ID to update'
        });
      }

      const itemIndex = wishlistItems.findIndex(item => item.id === parseInt(id as string));
      
      if (itemIndex === -1) {
        return res.status(404).json({
          error: 'Item not found',
          message: 'No wishlist item found with the provided ID'
        });
      }

      // Update the item with new data
      const updatedItem = {
        ...wishlistItems[itemIndex],
        ...req.body,
        updated_at: new Date().toISOString()
      };

      wishlistItems[itemIndex] = updatedItem;

      return res.status(200).json({
        message: 'Wishlist item updated successfully',
        item: updatedItem
      });
    }

    if (req.method === 'DELETE') {
      // Remove movie from wishlist
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing item ID',
          message: 'Please provide a wishlist item ID to delete'
        });
      }

      const itemIndex = wishlistItems.findIndex(item => item.id === parseInt(id as string));
      
      if (itemIndex === -1) {
        return res.status(404).json({
          error: 'Item not found',
          message: 'No wishlist item found with the provided ID'
        });
      }

      const deletedItem = wishlistItems.splice(itemIndex, 1)[0];

      return res.status(200).json({
        message: 'Movie removed from wishlist successfully',
        item: deletedItem
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