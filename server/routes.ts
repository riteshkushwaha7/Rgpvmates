import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProfileSchema, 
  insertSwipeSchema, 
  insertMessageSchema, 
  insertPaymentSchema, 
  insertReportSchema,
  insertBlockSchema,
  insertContactSubmissionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Discover routes
  app.get('/api/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profiles = await storage.getDiscoverableProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching discoverable profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Swipe routes
  app.post('/api/swipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swipeData = insertSwipeSchema.parse({ ...req.body, swiperId: userId });
      
      await storage.createSwipe(swipeData);
      
      let isMatch = false;
      if (swipeData.isLike) {
        isMatch = await storage.checkForMatch(userId, swipeData.swipedId);
        if (isMatch) {
          await storage.createMatch(userId, swipeData.swipedId);
        }
      }
      
      res.json({ isMatch });
    } catch (error) {
      console.error("Error creating swipe:", error);
      res.status(400).json({ message: "Failed to create swipe" });
    }
  });

  // Match routes
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Message routes
  app.get('/api/matches/:matchId/messages', isAuthenticated, async (req, res) => {
    try {
      const { matchId } = req.params;
      const messages = await storage.getMatchMessages(matchId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ 
        ...req.body, 
        matchId, 
        senderId: userId 
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to create message" });
    }
  });

  // Payment routes
  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentData = insertPaymentSchema.parse({ ...req.body, userId });
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(400).json({ message: "Failed to create payment" });
    }
  });

  app.put('/api/payments/:paymentId', isAuthenticated, async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { status } = req.body;
      const payment = await storage.updatePaymentStatus(paymentId, status);
      
      // If payment is completed, update profile to paid
      if (status === 'completed') {
        const userId = payment.userId;
        await storage.updateProfile(userId, { isPaid: true });
      }
      
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(400).json({ message: "Failed to update payment" });
    }
  });

  // Report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = insertReportSchema.parse({ ...req.body, reporterId: userId });
      await storage.createReport(reportData);
      res.json({ message: "Report submitted successfully" });
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(400).json({ message: "Failed to create report" });
    }
  });

  // Block routes
  app.post('/api/blocks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockData = insertBlockSchema.parse({ ...req.body, blockerId: userId });
      await storage.createBlock(blockData);
      res.json({ message: "User blocked successfully" });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(400).json({ message: "Failed to block user" });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const submissionData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(submissionData);
      res.json({ message: "Contact form submitted successfully", id: submission.id });
    } catch (error) {
      console.error("Error creating contact submission:", error);
      res.status(400).json({ message: "Failed to submit contact form" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/verifications', isAuthenticated, async (req, res) => {
    try {
      const verifications = await storage.getPendingVerifications();
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  });

  app.put('/api/admin/verifications/:profileId', isAuthenticated, async (req, res) => {
    try {
      const { profileId } = req.params;
      const { status } = req.body;
      const profile = await storage.updateVerificationStatus(profileId, status);
      res.json(profile);
    } catch (error) {
      console.error("Error updating verification:", error);
      res.status(400).json({ message: "Failed to update verification" });
    }
  });

  app.get('/api/admin/reports', isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getUserReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/admin/contacts', isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContactSubmissions();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.put('/api/admin/contacts/:contactId', isAuthenticated, async (req, res) => {
    try {
      const { contactId } = req.params;
      const { isResolved } = req.body;
      const contact = await storage.updateContactSubmissionStatus(contactId, isResolved);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact submission:", error);
      res.status(400).json({ message: "Failed to update contact submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
