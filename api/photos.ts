import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for photos (in production, use cloud storage)
let photos: any[] = [];
let photoIdCounter = 1;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get photos by date_id or all photos
      const { date_id } = req.query;
      
      let filteredPhotos = [...photos];
      
      if (date_id) {
        filteredPhotos = filteredPhotos.filter(photo => 
          photo.date_id === parseInt(date_id as string)
        );
      }

      return res.status(200).json({
        photos: filteredPhotos,
        total: filteredPhotos.length
      });
    }

    if (req.method === 'POST') {
      // Upload new photo(s)
      const {
        date_id,
        photos: photoFiles,
        description = ''
      } = req.body;

      // Basic validation
      if (!date_id) {
        return res.status(400).json({
          error: 'Missing date_id',
          message: 'date_id is required to associate photos with a movie date'
        });
      }

      if (!photoFiles || !Array.isArray(photoFiles) || photoFiles.length === 0) {
        return res.status(400).json({
          error: 'No photos provided',
          message: 'Please provide at least one photo to upload'
        });
      }

      const uploadedPhotos = [];

      for (const photoFile of photoFiles) {
        // For demo purposes, we'll store base64 data
        // In production, upload to Cloudinary/S3 and store URLs
        
        if (!photoFile.data || !photoFile.filename) {
          continue; // Skip invalid files
        }

        const newPhoto = {
          id: photoIdCounter++,
          date_id: parseInt(date_id),
          filename: photoFile.filename,
          data: photoFile.data, // base64 data or URL in production
          description,
          uploaded_at: new Date().toISOString(),
          file_size: photoFile.size || 0,
          content_type: photoFile.type || 'image/jpeg'
        };

        photos.push(newPhoto);
        uploadedPhotos.push({
          id: newPhoto.id,
          filename: newPhoto.filename,
          uploaded_at: newPhoto.uploaded_at
        });
      }

      return res.status(201).json({
        message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
        photos: uploadedPhotos
      });
    }

    if (req.method === 'DELETE') {
      // Delete photo
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing photo ID',
          message: 'Please provide a photo ID to delete'
        });
      }

      const photoIndex = photos.findIndex(photo => photo.id === parseInt(id as string));
      
      if (photoIndex === -1) {
        return res.status(404).json({
          error: 'Photo not found',
          message: 'No photo found with the provided ID'
        });
      }

      const deletedPhoto = photos.splice(photoIndex, 1)[0];

      return res.status(200).json({
        message: 'Photo deleted successfully',
        photo: {
          id: deletedPhoto.id,
          filename: deletedPhoto.filename
        }
      });
    }

    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET, POST, and DELETE methods are supported'
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
} 