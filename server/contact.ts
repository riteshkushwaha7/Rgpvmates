import { Router } from 'express';
import { db } from './db.js';
import { contactSubmissions } from './shared/schema.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const router = Router();

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'), // Allow concatenated email + phone format
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  issueType: z.string().optional(),
  priority: z.string().optional(),
});

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const contactData = contactSchema.parse(req.body);

    const [submission] = await db.insert(contactSubmissions).values({
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      description: contactData.message,
      issueType: contactData.issueType || 'profile',
      priority: contactData.priority || 'medium',
      isResolved: false,
    }).returning();

    res.status(201).json({
      message: 'Contact form submitted successfully',
      id: submission.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid form data',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get contact submissions (admin only)
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const submissions = await db.select().from(contactSubmissions)
      .orderBy(contactSubmissions.createdAt);

    res.json(submissions);
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({ error: 'Failed to get contact submissions' });
  }
});

// Mark contact submission as resolved (admin only)
router.put('/:id', async (req, res) => {
  try {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { isResolved } = req.body;

    await db.update(contactSubmissions)
      .set({
        isResolved,
        updatedAt: new Date(),
      })
      .where(eq(contactSubmissions.id, id));

    res.json({ message: 'Contact submission updated successfully' });
  } catch (error) {
    console.error('Update contact submission error:', error);
    res.status(500).json({ error: 'Failed to update contact submission' });
  }
});

export { router as contactRoutes };
