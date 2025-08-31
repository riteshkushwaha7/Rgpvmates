import { pgTable, foreignKey, varchar, timestamp, text, boolean, integer, index, jsonb, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const branch = pgEnum("branch", ['Automobile Engineering', 'Civil Engineering', 'Computer Science & Engineering', 'Electrical & Electronics Engineering', 'Electronics & Communication Engineering', 'Environmental Engineering', 'Industrial Engineering & Management', 'Industrial Production', 'Information Technology', 'Mechanical Engineering', 'Petrochemical Engineering', 'Master of Computer Applications (MCA)', 'Structural Engineering', 'Heat Power Engineering', 'Power Systems', 'CSE (PG)', 'Digital Communications', 'Computer Science and Business Systems', 'AIML', 'CSE (Data Sciences)', 'Data Sciences (PG)', 'Information Technology (PG)', 'SoA', 'SoPS'])
export const college = pgEnum("college", ['University Institute of Technology (UIT)', 'School of Information Technology (SoIT)', 'School of Architecture (SoA)', 'School of Nanotechnology (SoNT)', 'School of Pharmaceutical Sciences (SoPS)'])
export const contactIssueType = pgEnum("contact_issue_type", ['profile', 'payment', 'abuse', 'suggestion'])
export const gender = pgEnum("gender", ['male', 'female', 'non-binary', 'prefer-not-to-say'])
export const graduationYear = pgEnum("graduation_year", ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'completed', 'failed'])
export const priority = pgEnum("priority", ['low', 'medium', 'high', 'urgent'])
export const verificationStatus = pgEnum("verification_status", ['pending', 'approved', 'rejected'])


export const matches = pgTable("matches", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	user1Id: varchar("user1_id").notNull(),
	user2Id: varchar("user2_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.user1Id],
			foreignColumns: [users.id],
			name: "matches_user1_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.user2Id],
			foreignColumns: [users.id],
			name: "matches_user2_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const contactSubmissions = pgTable("contact_submissions", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar().notNull(),
	email: varchar().notNull(),
	issueType: contactIssueType("issue_type").notNull(),
	subject: varchar().notNull(),
	description: text().notNull(),
	priority: priority().default('medium'),
	isResolved: boolean("is_resolved").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const messages = pgTable("messages", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	matchId: varchar("match_id").notNull(),
	senderId: varchar("sender_id").notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.matchId],
			foreignColumns: [matches.id],
			name: "messages_match_id_matches_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	amount: integer().notNull(),
	status: paymentStatus().default('pending'),
	razorpayPaymentId: varchar("razorpay_payment_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const reports = pgTable("reports", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	reporterId: varchar("reporter_id").notNull(),
	reportedId: varchar("reported_id").notNull(),
	reason: text().notNull(),
	description: text(),
	isResolved: boolean("is_resolved").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.id],
			name: "reports_reporter_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reportedId],
			foreignColumns: [users.id],
			name: "reports_reported_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const swipes = pgTable("swipes", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	swiperId: varchar("swiper_id").notNull(),
	swipedId: varchar("swiped_id").notNull(),
	action: boolean().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.swiperId],
			foreignColumns: [users.id],
			name: "swipes_swiper_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.swipedId],
			foreignColumns: [users.id],
			name: "swipes_swiped_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const userActivities = pgTable("user_activities", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	type: varchar().notNull(),
	targetUserId: varchar("target_user_id"),
	data: jsonb().default({}),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_activities_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const profiles = pgTable("profiles", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	age: integer().notNull(),
	gender: gender().notNull(),
	branch: text().notNull(),
	graduationYear: graduationYear("graduation_year"),
	bio: text(),
	profilePicture: varchar("profile_picture"),
	photos: jsonb().default([]),
	socialHandles: jsonb("social_handles").default({}),
	verificationStatus: verificationStatus("verification_status").default('pending'),
	studentIdImage: varchar("student_id_image"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const blocks = pgTable("blocks", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	blockerId: varchar("blocker_id").notNull(),
	blockedId: varchar("blocked_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.blockerId],
			foreignColumns: [users.id],
			name: "blocks_blocker_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.blockedId],
			foreignColumns: [users.id],
			name: "blocks_blocked_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	phone: varchar(),
	password: varchar(),
	college: college(),
	idCardFront: varchar("id_card_front"),
	idCardBack: varchar("id_card_back"),
	isApproved: boolean("is_approved").default(false),
	isSuspended: boolean("is_suspended").default(false),
	premiumBypassed: boolean("premium_bypassed").default(false),
	paymentDone: boolean("payment_done").default(false),
	paymentId: varchar("payment_id"),
	isAdmin: boolean("is_admin").default(false),
	likedUsers: jsonb("liked_users").default([]),
	dislikedUsers: jsonb("disliked_users").default([]),
	blockedUsers: jsonb("blocked_users").default([]),
	reportedUsers: jsonb("reported_users").default([]),
	matches: jsonb().default([]),
	rejectedUsers: jsonb("rejected_users").default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	age: integer(),
	branch: text(),
	graduationYear: graduationYear("graduation_year"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
