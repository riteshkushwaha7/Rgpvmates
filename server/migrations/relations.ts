import { relations } from "drizzle-orm/relations";
import { users, matches, messages, payments, reports, swipes, userActivities, profiles, blocks } from "./schema";

export const matchesRelations = relations(matches, ({one, many}) => ({
	user_user1Id: one(users, {
		fields: [matches.user1Id],
		references: [users.id],
		relationName: "matches_user1Id_users_id"
	}),
	user_user2Id: one(users, {
		fields: [matches.user2Id],
		references: [users.id],
		relationName: "matches_user2Id_users_id"
	}),
	messages: many(messages),
}));

export const usersRelations = relations(users, ({many}) => ({
	matches_user1Id: many(matches, {
		relationName: "matches_user1Id_users_id"
	}),
	matches_user2Id: many(matches, {
		relationName: "matches_user2Id_users_id"
	}),
	messages: many(messages),
	payments: many(payments),
	reports_reporterId: many(reports, {
		relationName: "reports_reporterId_users_id"
	}),
	reports_reportedId: many(reports, {
		relationName: "reports_reportedId_users_id"
	}),
	swipes_swiperId: many(swipes, {
		relationName: "swipes_swiperId_users_id"
	}),
	swipes_swipedId: many(swipes, {
		relationName: "swipes_swipedId_users_id"
	}),
	userActivities: many(userActivities),
	profiles: many(profiles),
	blocks_blockerId: many(blocks, {
		relationName: "blocks_blockerId_users_id"
	}),
	blocks_blockedId: many(blocks, {
		relationName: "blocks_blockedId_users_id"
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	match: one(matches, {
		fields: [messages.matchId],
		references: [matches.id]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	user_reporterId: one(users, {
		fields: [reports.reporterId],
		references: [users.id],
		relationName: "reports_reporterId_users_id"
	}),
	user_reportedId: one(users, {
		fields: [reports.reportedId],
		references: [users.id],
		relationName: "reports_reportedId_users_id"
	}),
}));

export const swipesRelations = relations(swipes, ({one}) => ({
	user_swiperId: one(users, {
		fields: [swipes.swiperId],
		references: [users.id],
		relationName: "swipes_swiperId_users_id"
	}),
	user_swipedId: one(users, {
		fields: [swipes.swipedId],
		references: [users.id],
		relationName: "swipes_swipedId_users_id"
	}),
}));

export const userActivitiesRelations = relations(userActivities, ({one}) => ({
	user: one(users, {
		fields: [userActivities.userId],
		references: [users.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const blocksRelations = relations(blocks, ({one}) => ({
	user_blockerId: one(users, {
		fields: [blocks.blockerId],
		references: [users.id],
		relationName: "blocks_blockerId_users_id"
	}),
	user_blockedId: one(users, {
		fields: [blocks.blockedId],
		references: [users.id],
		relationName: "blocks_blockedId_users_id"
	}),
}));