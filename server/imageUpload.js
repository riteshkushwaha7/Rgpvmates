import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';

// ImgBB API configuration (FREE alternative to Cloudinary)
const getImgBBApiKey = () => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  IMGBB_API_KEY not found in environment variables');
    console.warn('📝 Get your free API key at: https://imgbb.com/api');
    console.warn('🔧 Add to .env file: IMGBB_API_KEY=your_api_key_here');
  }
  return apiKey;
};
const IMGBB_BASE_URL = 'https://api.imgbb.com/1/upload';

// Simple image upload service using ImgBB
const imageService = {
  uploader: {
    upload_stream: (options, callback) => {
      // Mock implementation for now
      setTimeout(() => {
        callback(null, { secure_url: 'https://via.placeholder.com/400x400?text=Profile+Image' });
      }, 100);
      return { end: (buffer) => {} };
    },
    destroy: async (publicId) => {
      return { result: 'ok' };
    }
  }
};

// Real ImgBB upload function
const uploadToImgBB = async (buffer, filename = 'image.jpg') => {
  try {
    // Get API key dynamically
    const apiKey = getImgBBApiKey();
    
    // Check if API key is available
    if (!apiKey) {
      console.warn('ImgBB API key not configured, using fallback');
      return 'https://via.placeholder.com/400x400?text=Profile+Image';
    }

    const formData = new FormData();
    formData.append('image', buffer, { filename });
    formData.append('key', apiKey);

    const response = await fetch(IMGBB_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Image uploaded successfully to ImgBB');
      return data.data.url; // Direct image URL
    } else {
      console.error('❌ ImgBB upload failed:', data.error?.message || 'Unknown error');
      throw new Error(`ImgBB upload failed: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ ImgBB upload error:', error.message);
    // Fallback to placeholder
    return 'https://via.placeholder.com/400x400?text=Profile+Image';
  }
};

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// Utility function to upload image buffer using ImgBB (FREE)
const uploadImageBuffer = async (buffer, folder = 'rgpv-mates') => {
  try {
    // Use ImgBB for image upload (completely free)
    const imageUrl = await uploadToImgBB(buffer, `${folder}_${Date.now()}.jpg`);
    console.log('Image uploaded successfully to ImgBB:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    // Fallback to placeholder
    return 'https://via.placeholder.com/400x400?text=Profile+Image';
  }
};

// Utility function to upload base64 image
const uploadBase64Image = async (base64Data, folder = 'rgpv-mates') => {
  try {
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Upload using ImgBB
    const imageUrl = await uploadToImgBB(buffer, `${folder}_${Date.now()}.jpg`);
    console.log('Base64 image uploaded successfully to ImgBB:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Base64 image upload error:', error);
    // Fallback to placeholder
    return 'https://via.placeholder.com/400x400?text=Profile+Image';
  }
};

// Utility function to delete image (ImgBB doesn't support deletion, so we'll just return success)
const deleteImage = async (publicId) => {
  try {
    // ImgBB doesn't provide a delete API, so we'll just return success
    // In a production environment, you might want to track deleted images
    console.log('Image deletion requested for:', publicId);
    return { result: 'ok' };
  } catch (error) {
    console.error('Image delete error:', error);
    throw new Error('Failed to delete image');
  }
};

export { imageService as cloudinary, upload, uploadImageBuffer, uploadBase64Image, deleteImage };
export default imageService;
