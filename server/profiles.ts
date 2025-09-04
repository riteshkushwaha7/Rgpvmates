import { Router } from 'express';
import { db } from './db.js';
import { profiles, users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { upload, uploadBase64Image } from './imageUpload.js';
import { requireAuth } from './middleware/jwtAuth.js';

const router = Router();

// Profile schema
const profileSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  branch: z.enum(['computer-science', 'mechanical', 'electrical', 'civil', 'electronics', 'chemical']).optional(),
  graduationYear: z.enum(['2026', '2027', '2028', '2029', '2030']).optional(),
  bio: z.string().max(500).optional(),
  profilePicture: z.string().url().optional(),
  photos: z.array(z.string().url()).optional(),
  socialHandles: z.record(z.string()).optional(),
});

// Create/Update profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const profileData = profileSchema.parse(req.body);

    // Check if profile already exists
    const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

    let result;
    if (existingProfile.length > 0) {
      // Update existing profile - don't allow editing age, name, graduation year
      const updateData = { ...profileData };
      delete updateData.age; // Age cannot be edited
      
      [result] = await db.update(profiles)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(profiles.userId, user.id))
        .returning();
    } else {
      // Create new profile - all fields required for new profiles
      if (!profileData.age || !profileData.gender || !profileData.branch || !profileData.graduationYear) {
        return res.status(400).json({ error: 'Age, gender, branch, and graduation year are required for new profiles' });
      }
      
      [result] = await db.insert(profiles)
        .values({ ...profileData, userId: user.id })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid profile data' });
    }
    res.status(500).json({ error: 'Profile operation failed' });
  }
});

// Upload profile picture
router.post('/upload-picture', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = req.file.path;

    // Update profile with new picture
    const [profile] = await db.update(profiles)
      .set({ profilePicture: imageUrl, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))
      .returning();

    res.json({ profilePicture: imageUrl });
  } catch (error) {
    console.error('Upload picture error:', error);
    res.status(500).json({ error: 'Failed to upload picture' });
  }
});

// Upload additional photos
router.post('/upload-photos', requireAuth, upload.array('photos', 5), async (req, res) => {
  try {
    const user = req.user;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const photoUrls = (req.files as Express.Multer.File[]).map(file => file.path);

    // Get existing photos
    const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    const existingPhotos = existingProfile[0]?.photos || [];

    // Add new photos (limit to 5 total)
    const allPhotos = [...existingPhotos, ...photoUrls].slice(0, 5);

    // Update profile with new photos
    const [profile] = await db.update(profiles)
      .set({ photos: allPhotos, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))
      .returning();

    res.json({ photos: allPhotos });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Remove photo
router.delete('/remove-photo/:index', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const photoIndex = parseInt(req.params.index);
    if (isNaN(photoIndex) || photoIndex < 0) {
      return res.status(400).json({ error: 'Invalid photo index' });
    }

    // Get existing photos
    const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    const existingPhotos = existingProfile[0]?.photos || [];

    if (photoIndex >= existingPhotos.length) {
      return res.status(400).json({ error: 'Photo index out of range' });
    }

    // Remove photo at index
    const updatedPhotos = existingPhotos.filter((_, index) => index !== photoIndex);

    // Update profile
    const [profile] = await db.update(profiles)
      .set({ photos: updatedPhotos, updatedAt: new Date() })
      .where(eq(profiles.userId, user.id))
      .returning();

    res.json({ photos: updatedPhotos });
  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json({ error: 'Failed to remove photo' });
  }
});

// Get user's own profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const profile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    
    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get all profiles (for admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allProfiles = await db.select().from(profiles);
    res.json(allProfiles);
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Failed to get profiles' });
  }
});

// Get profile by user ID
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const { userId } = req.params;
    const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    
    if (profile.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

export { router as profileRoutes };
