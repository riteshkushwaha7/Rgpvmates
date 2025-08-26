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
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
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
export const branchEnum = pgEnum("branch", [
  "computer-science",
  "mechanical-engineering", 
  "electrical-engineering",
  "civil-engineering",
  "electronics-communication",
  "information-technology",
  "chemical-engineering",
  "biotechnology"
]);
export const yearEnum = pgEnum("year", ["1st", "2nd", "3rd", "4th"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"]);
export const contactIssueTypeEnum = pgEnum("contact_issue_type", ["profile", "payment", "abuse", "suggestion"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  age: integer("age"),
  gender: genderEnum("gender"),
  branch: branchEnum("branch"),
  year: yearEnum("year"),
  phone: varchar("phone"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  studentIdImage: text("student_id_image"),
  isPaid: boolean("is_paid").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const swipes = pgTable("swipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  swiperId: varchar("swiper_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  swipedId: varchar("swiped_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isLike: boolean("is_like").notNull(),
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
