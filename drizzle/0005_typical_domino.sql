CREATE TABLE "degree_program" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"is_graduate_level" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "degree_program_id" integer;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_degree_program_id_fkey" FOREIGN KEY ("degree_program_id") REFERENCES "public"."degree_program"("id") ON DELETE set null ON UPDATE no action;