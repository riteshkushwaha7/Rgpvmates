DROP INDEX "IDX_session_expire";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "branch" SET DATA TYPE branch;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "branch" SET DATA TYPE branch;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");