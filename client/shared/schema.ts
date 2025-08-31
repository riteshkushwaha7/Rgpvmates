import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table (mandatory for session management)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const genderEnum = pgEnum("gender", ["male", "female", "non-binary", "prefer-not-to-say"]);
export const collegeEnum = pgEnum("college", [
  "University Institute of Technology (UIT)",
  "School of Information Technology (SoIT)",
  "School of Architecture (SoA)",
  "School of Nanotechnology (SoNT)",
  "School of Pharmaceutical Sciences (SoPS)"
]);
export const branchEnum = pgEnum("branch", [
  "computer-science",
  "mechanical", 
  "electrical",
  "civil",
  "electronics",
  "chemical"
]);
export const graduationYearEnum = pgEnum("graduation_year", ["2026", "2027", "2028", "2029", "2030"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"]);
export const contactIssueTypeEnum = pgEnum("contact_issue_type", ["profile", "payment", "abuse", "suggestion"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);

// User storage table (updated for simple auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  password: varchar("password"), // Hashed password for simple auth
  college: collegeEnum("college"), // College selection
  idCardFront: varchar("id_card_front"), // Front side of ID card URL
  idCardBack: varchar("id_card_back"), // Back side of ID card URL
  isApproved: boolean("is_approved").default(false), // Admin approval status
  isSuspended: boolean("is_suspended").default(false), // User suspension status
  premiumBypassed: boolean("premium_bypassed").default(false), // Premium bypass flag
  paymentDone: boolean("payment_done").default(false), // Payment completion status
  paymentId: varchar("payment_id"), // Razorpay transaction ID or "BYPASS"
  isAdmin: boolean("is_admin").default(false), // Admin flag
  // New arrays for optimal swipe and interaction management
  likedUsers: jsonb("liked_users").default([]), // Array of user IDs that this user has liked
  dislikedUsers: jsonb("disliked_users").default([]), // Array of user IDs that this user has disliked
  blockedUsers: jsonb("blocked_users").default([]), // Array of user IDs that this user has blocked
  reportedUsers: jsonb("reported_users").default([]), // Array of user IDs that this user has reported
  matches: jsonb("matches").default([]), // Array of user IDs that this user has matched with
  rejectedUsers: jsonb("rejected_users").default([]), // Array of rejected user IDs (keeping for backward compatibility)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  branch: branchEnum("branch").notNull(),
  graduationYear: graduationYearEnum("graduation_year"),
  bio: text("bio"),
  profilePicture: varchar("profile_picture"),
  photos: jsonb("photos").default([]), // Array of additional photos
  socialHandles: jsonb("social_handles").default({}), // Object with social media handles
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  studentIdImage: varchar("student_id_image"), // Student ID image URL
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  swipedId: varchar("swiped_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: boolean("action").notNull(), // true for like, false for reject
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").default("pending"),
  razorpayPaymentId: varchar("razorpay_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedId: varchar("reported_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  description: text("description"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockerId: varchar("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: varchar("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  issueType: contactIssueTypeEnum("issue_type").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  priority: priorityEnum("priority").default("medium"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userActivities = pgTable("user_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // 'match', 'reject', 'message', 'profile_view', 'profile_update'
  targetUserId: varchar("target_user_id"), // For activities involving another user
  data: jsonb("data").default({}), // Additional activity data
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  swipesGiven: many(swipes, { relationName: "swiper" }),
  swipesReceived: many(swipes, { relationName: "swiped" }),
  matchesAsUser1: many(matches, { relationName: "user1" }),
  matchesAsUser2: many(matches, { relationName: "user2" }),
  messages: many(messages),
  payments: many(payments),
  reportsGiven: many(reports, { relationName: "reporter" }),
  reportsReceived: many(reports, { relationName: "reported" }),
  blocksGiven: many(blocks, { relationName: "blocker" }),
  blocksReceived: many(blocks, { relationName: "blocked" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, {
    fields: [swipes.swiperId],
    references: [users.id],
    relationName: "swiper",
  }),
  swiped: one(users, {
    fields: [swipes.swipedId],
    references: [users.id],
    relationName: "swiped",
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reported: one(users, {
    fields: [reports.reportedId],
    references: [users.id],
    relationName: "reported",
  }),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, {
    fields: [blocks.blockerId],
    references: [users.id],
    relationName: "blocker",
  }),
  blocked: one(users, {
    fields: [blocks.blockedId],
    references: [users.id],
    relationName: "blocked",
  }),
}));

// Zod schemas for validation
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
