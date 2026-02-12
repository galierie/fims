CREATE TABLE "accountRole" (
	"accountRole" varchar(255) PRIMARY KEY NOT NULL,
	"canAddFaculty" smallint NOT NULL,
	"canModifyFaculty" smallint NOT NULL,
	"canAddAccount" smallint NOT NULL,
	"canModifyAccount" smallint NOT NULL,
	"canViewChangeLogs" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"accountId" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" varchar(255) NOT NULL,
	"accountRole" varchar(50) NOT NULL,
	CONSTRAINT "account_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_accountRole_accountRole_accountRole_fk" FOREIGN KEY ("accountRole") REFERENCES "public"."accountRole"("accountRole") ON DELETE no action ON UPDATE no action;