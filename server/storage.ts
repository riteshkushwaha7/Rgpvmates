import {
  users,
  profiles,
  swipes,
  matches,
  messages,
  payments,
  reports,
  blocks,
  contactSubmissions,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type InsertSwipe,
  type InsertMessage,
  type InsertPayment,
  type InsertReport,
  type InsertBlock,
  type InsertContactSubmission,
  type Match,
  type Message,
  type Payment,
  type Report,
  type Block,
  type ContactSubmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, ne, notInArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(userId: string): Promise<Profile | undefined>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile>;
  getPendingVerifications(): Promise<Array<Profile & { user: User }>>;
  updateVerificationStatus(profileId: string, status: 'approved' | 'rejected'): Promise<Profile>;
  
  // Swipe and Match operations
  createSwipe(swipe: InsertSwipe): Promise<void>;
  checkForMatch(swiperId: string, swipedId: string): Promise<boolean>;
  createMatch(user1Id: string, user2Id: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Array<Match & { otherUser: User & { profile: Profile } }>>;
  getDiscoverableProfiles(userId: string): Promise<Array<User & { profile: Profile }>>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMatchMessages(matchId: string): Promise<Array<Message & { sender: User }>>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(paymentId: string, status: string): Promise<Payment>;
  
  // Report and Block operations
  createReport(report: InsertReport): Promise<void>;
  createBlock(block: InsertBlock): Promise<void>;
  getUserReports(): Promise<Array<Report & { reporter: User; reported: User }>>;
  isUserBlocked(userId1: string, userId2: string): Promise<boolean>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  updateContactSubmissionStatus(id: string, isResolved: boolean): Promise<ContactSubmission>;
  
  // Admin operations
  getStats(): Promise<{
    pending: number;
    verified: number;
    matches: number;
    revenue: number;
    reports: number;
    contacts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async getPendingVerifications(): Promise<Array<Profile & { user: User }>> {
    const result = await db
      .select()
      .from(profiles)
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.verificationStatus, 'pending'))
      .orderBy(desc(profiles.createdAt));
    
    return result.map(row => ({
      ...row.profiles,
      user: row.users!,
    }));
  }

  async updateVerificationStatus(profileId: string, status: 'approved' | 'rejected'): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ 
        verificationStatus: status,
        updatedAt: new Date() 
      })
      .where(eq(profiles.id, profileId))
      .returning();
    return profile;
  }

  // Swipe and Match operations
  async createSwipe(swipe: InsertSwipe): Promise<void> {
    await db.insert(swipes).values(swipe);
  }

  async checkForMatch(swiperId: string, swipedId: string): Promise<boolean> {
    const [existingSwipe] = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, swipedId),
          eq(swipes.swipedId, swiperId),
          eq(swipes.isLike, true)
        )
      );
    
    return !!existingSwipe;
  }

  async createMatch(user1Id: string, user2Id: string): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({ user1Id, user2Id })
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Array<Match & { otherUser: User & { profile: Profile } }>> {
    const result = await db
      .select()
      .from(matches)
      .leftJoin(users, or(
        and(eq(matches.user1Id, userId), eq(users.id, matches.user2Id)),
        and(eq(matches.user2Id, userId), eq(users.id, matches.user1Id))
      ))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
      .orderBy(desc(matches.createdAt));

    return result.map(row => ({
      ...row.matches,
      otherUser: {
        ...row.users!,
        profile: row.profiles!,
      },
    }));
  }

  async getDiscoverableProfiles(userId: string): Promise<Array<User & { profile: Profile }>> {
    // Get profiles that haven't been swiped on by the current user
    const swipedIds = await db
      .select({ swipedId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));

    const swipedIdsList = swipedIds.map(s => s.swipedId);

    // Get blocked users
    const blockedIds = await db
      .select({ blockedId: blocks.blockedId })
      .from(blocks)
      .where(eq(blocks.blockerId, userId));

    const blockedIdsList = blockedIds.map(b => b.blockedId);

    const allExcludedIds = [...swipedIdsList, ...blockedIdsList];

    const result = await db
      .select()
      .from(profiles)
      .leftJoin(users, eq(profiles.userId, users.id))
      .where(
        and(
          eq(profiles.verificationStatus, 'approved'),
          eq(profiles.isPaid, true),
          eq(profiles.isActive, true),
          ne(profiles.userId, userId),
          ...(allExcludedIds.length > 0 ? [notInArray(profiles.userId, allExcludedIds)] : [])
        )
      )
      .limit(50);

    return result.map(row => ({
      ...row.users!,
      profile: row.profiles,
    }));
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getMatchMessages(matchId: string): Promise<Array<Message & { sender: User }>> {
    const result = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);

    return result.map(row => ({
      ...row.messages,
      sender: row.users!,
    }));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ status: status as any })
      .where(eq(payments.id, paymentId))
      .returning();
    return payment;
  }

  // Report and Block operations
  async createReport(report: InsertReport): Promise<void> {
    await db.insert(reports).values(report);
  }

  async createBlock(block: InsertBlock): Promise<void> {
    await db.insert(blocks).values(block);
  }

  async getUserReports(): Promise<Array<Report & { reporter: User; reported: User }>> {
    const result = await db
      .select()
      .from(reports)
      .leftJoin(users, eq(reports.reporterId, users.id))
      .leftJoin(users, eq(reports.reportedId, users.id))
      .orderBy(desc(reports.createdAt));

    return result.map(row => ({
      ...row.reports,
      reporter: row.users!,
      reported: row.users!,
    }));
  }

  async isUserBlocked(userId1: string, userId2: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(blocks)
      .where(
        or(
          and(eq(blocks.blockerId, userId1), eq(blocks.blockedId, userId2)),
          and(eq(blocks.blockerId, userId2), eq(blocks.blockedId, userId1))
        )
      );
    
    return !!block;
  }

  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  async updateContactSubmissionStatus(id: string, isResolved: boolean): Promise<ContactSubmission> {
    const [submission] = await db
      .update(contactSubmissions)
      .set({ isResolved })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return submission;
  }

  // Admin operations
  async getStats(): Promise<{
    pending: number;
    verified: number;
    matches: number;
    revenue: number;
    reports: number;
    contacts: number;
  }> {
    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(eq(profiles.verificationStatus, 'pending'));

    const [verifiedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(eq(profiles.verificationStatus, 'approved'));

    const [matchCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches);

    const [revenueResult] = await db
      .select({ total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(eq(payments.status, 'completed'));

    const [reportsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.isResolved, false));

    const [contactsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.isResolved, false));

    return {
      pending: pendingCount.count,
      verified: verifiedCount.count,
      matches: matchCount.count,
      revenue: revenueResult.total || 0,
      reports: reportsCount.count,
      contacts: contactsCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
