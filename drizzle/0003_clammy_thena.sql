CREATE TABLE "faculty" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"department" text,
	"last_updated" timestamp
);
