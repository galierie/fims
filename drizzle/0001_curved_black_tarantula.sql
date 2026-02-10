ALTER TABLE "account" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "accountRole" TO "role";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "account_email_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "account_accountRole_accountRole_accountRole_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_accountRole_accountRole_fk" FOREIGN KEY ("role") REFERENCES "public"."accountRole"("accountRole") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");