import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Registration schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().min(18).max(100),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']), // CRITICAL: Gender for dating app
  college: z.string(),
  branch: z.string(),
  graduationYear: z.string(),
  profileImageUrl: z.string().optional(),
  idCardFront: z.string().optional(),
  idCardBack: z.string().optional(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      age,
      gender,
      college, 
      branch,
      graduationYear,
      profileImageUrl,
      idCardFront,
      idCardBack,
      phone,
      acceptTerms 
    } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      age,
      gender, // Added gender
      college,
      branch,
      graduationYear,
      profileImageUrl,
      idCardFront,
      idCardBack,
      phone,
      isApproved: false, // Requires admin approval
    }).returning();

    // Set session
    req.session.userId = newUser.id;
    req.session.email = newUser.email;
    req.session.isAdmin = newUser.isAdmin;

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      user: {
        id: newUser.id,
        email: newUser.email,
        isApproved: newUser.isApproved,
        isAdmin: newUser.isAdmin,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult[0];

    // Check if user is approved (unless admin)
    if (!user.isApproved && !user.isAdmin) {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account has been suspended' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
            // NO SESSION - Just return user data for frontend storage
        console.log('✅ Login successful - No session needed');

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        profileImageUrl: user.profileImageUrl,
        isApproved: user.isApproved,
        isAdmin: user.isAdmin,
        paymentDone: user.paymentDone,
        likedUsers: user.likedUsers,
        dislikedUsers: user.dislikedUsers,
        blockedUsers: user.blockedUsers,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

export { router as authRoutes };
