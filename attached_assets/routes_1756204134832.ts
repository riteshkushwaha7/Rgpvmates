import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertSwipeSchema, insertMessageSchema, insertPaymentSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

// 🚨 Replace replitAuth with a simple mock auth
function isAuthenticated(req: any, res: any, next: any) {
  // For now, pretend the user is always logged in
  // Later replace with JWT/email auth
  req.user = { claims: { sub: "test-user" } }; 
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // No more setupAuth(app);

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

  // ... ✅ keep the rest of your routes same
  // Just make sure they all use the new `isAuthenticated`
  
  const httpServer = createServer(app);
  return httpServer;
}
