import { Router } from 'express';
import { upload, uploadImageBuffer } from './imageUpload.js';

const router = Router();

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, 'rgpv-mates');
    
    res.json({ 
      success: true, 
      imageUrl,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadPromises = req.files.map(file => uploadImageBuffer(file.buffer, 'rgpv-mates'));
    const imageUrls = await Promise.all(uploadPromises);
    
    res.json({ 
      success: true, 
      imageUrls,
      message: 'Images uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

// Upload contact image (for contact us form)
router.post('/contact-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, 'rgpv-mates-contact');
    
    res.json({ 
      success: true, 
      imageUrl,
      message: 'Contact image uploaded successfully' 
    });
  } catch (error) {
    console.error('Contact image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload contact image',
      details: error.message 
    });
  }
});

export { router as uploadRoutes };
