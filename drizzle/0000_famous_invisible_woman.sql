CREATE TABLE "academic_semester" (
	"id" serial PRIMARY KEY NOT NULL,
	"semester_number" smallint NOT NULL,
	"academic_year" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_position" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_status" (
	"appointment_status" varchar(50) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"operator_id" text,
	"tuple_id" integer,
	"operation" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"units" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" serial PRIMARY KEY NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"middle_name" varchar(100) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"suffix" varchar(50),
	"maiden_name" varchar(100),
	"birth_date" date NOT NULL,
	"status" varchar(50),
	"date_of_original_appointment" date NOT NULL,
	"psi_item" varchar(50) NOT NULL,
	"employee_number" varchar(50) NOT NULL,
	"tin" varchar(50) NOT NULL,
	"gsis" varchar(50) NOT NULL,
	"philhealth" varchar(50) NOT NULL,
	"pagibig" varchar(50) NOT NULL,
	"remarks" text,
	"latest_changelog_id" integer
);
--> statement-breakpoint
CREATE TABLE "faculty_academic_semester" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"academic_semester_id" integer,
	"current_rank_id" integer,
	"current_highest_educational_attainment_id" integer,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "faculty_admin_position" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"admin_position_id" integer,
	"office_id" integer,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"administrative_load_credit" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_admin_work" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"nature_of_work" varchar(200) NOT NULL,
	"office_id" integer,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"administrative_load_credit" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_comm_membership" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"membership" varchar(100) NOT NULL,
	"committee" varchar(150) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"administrative_load_credit" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_contact_number" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"contact_number" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_course" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"course_id" integer,
	"section" varchar(50),
	"number_of_students" integer,
	"teaching_load_credit" numeric(5, 2) NOT NULL,
	"section_set" numeric(4, 3)
);
--> statement-breakpoint
CREATE TABLE "faculty_educational_attainment" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"degree" varchar(100) NOT NULL,
	"institution" varchar(200) NOT NULL,
	"graduation_year" integer
);
--> statement-breakpoint
CREATE TABLE "faculty_email" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"email" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_extension" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"nature_of_extension" varchar(200) NOT NULL,
	"agency" varchar(150) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"extension_load_credit" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_field_of_interest" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"field_of_interest_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_home_address" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"home_address" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_mentoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"student_id" integer,
	"category" varchar(50),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"teaching_load_credit" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_rank" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_id" integer NOT NULL,
	"rank_id" integer,
	"appointment_status" varchar(50),
	"date_of_tenure_or_renewal" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty_research" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"research_id" integer,
	"research_load_credit" numeric(5, 2) NOT NULL,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "faculty_study_load" (
	"id" serial PRIMARY KEY NOT NULL,
	"faculty_academic_semester_id" integer,
	"degree_program" varchar(200) NOT NULL,
	"university" varchar(150) NOT NULL,
	"study_load_units" numeric(5, 2) NOT NULL,
	"on_full_time_leave_with_pay" boolean NOT NULL,
	"is_faculty_fellowship_recipient" boolean NOT NULL,
	"study_load_credit" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_of_interest" (
	"id" serial PRIMARY KEY NOT NULL,
	"field" varchar(100) NOT NULL,
	CONSTRAINT "field_of_interest_field_key" UNIQUE("field")
);
--> statement-breakpoint
CREATE TABLE "office" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"role" varchar(50) NOT NULL,
	"latest_changelog_id" integer
);
--> statement-breakpoint
CREATE TABLE "rank" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"salary_grade" varchar(10) NOT NULL,
	"salary_rate" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"funding" text
);
--> statement-breakpoint
CREATE TABLE "role" (
	"role" varchar(50) PRIMARY KEY NOT NULL,
	"can_add_faculty" boolean NOT NULL,
	"can_modify_faculty" boolean NOT NULL,
	"can_add_account" boolean NOT NULL,
	"can_modify_account" boolean NOT NULL,
	"can_view_changelogs" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status" (
	"status" varchar(50) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" serial PRIMARY KEY NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"middle_name" varchar(100) NOT NULL,
	"first_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "profile_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "changelog" ADD CONSTRAINT "changelog_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_latest_changelog_id_fkey" FOREIGN KEY ("latest_changelog_id") REFERENCES "public"."changelog"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_status_fkey" FOREIGN KEY ("status") REFERENCES "public"."status"("status") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_academic_semester" ADD CONSTRAINT "faculty_academic_semester_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_academic_semester" ADD CONSTRAINT "faculty_academic_semester_academic_semester_id_fkey" FOREIGN KEY ("academic_semester_id") REFERENCES "public"."academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_academic_semester" ADD CONSTRAINT "faculty_academic_semester_current_rank_id_fkey" FOREIGN KEY ("current_rank_id") REFERENCES "public"."faculty_rank"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_academic_semester" ADD CONSTRAINT "faculty_academic_semester_current_highest_educational_attainment_id_fkey" FOREIGN KEY ("current_highest_educational_attainment_id") REFERENCES "public"."faculty_educational_attainment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_admin_position" ADD CONSTRAINT "faculty_admin_position_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_admin_position" ADD CONSTRAINT "faculty_admin_position_admin_position_id_fkey" FOREIGN KEY ("admin_position_id") REFERENCES "public"."admin_position"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_admin_position" ADD CONSTRAINT "faculty_admin_position_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."office"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_admin_work" ADD CONSTRAINT "faculty_admin_work_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_admin_work" ADD CONSTRAINT "faculty_admin_work_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."office"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_comm_membership" ADD CONSTRAINT "faculty_comm_membership_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_contact_number" ADD CONSTRAINT "faculty_contact_number_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_course" ADD CONSTRAINT "faculty_course_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_course" ADD CONSTRAINT "faculty_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_educational_attainment" ADD CONSTRAINT "faculty_educational_attainment_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_email" ADD CONSTRAINT "faculty_email_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_extension" ADD CONSTRAINT "faculty_extension_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_field_of_interest" ADD CONSTRAINT "faculty_field_of_interest_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_field_of_interest" ADD CONSTRAINT "faculty_field_of_interest_field_of_interest_id_fkey" FOREIGN KEY ("field_of_interest_id") REFERENCES "public"."field_of_interest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_home_address" ADD CONSTRAINT "faculty_home_address_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_mentoring" ADD CONSTRAINT "faculty_mentoring_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_mentoring" ADD CONSTRAINT "faculty_mentoring_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_rank" ADD CONSTRAINT "faculty_rank_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_rank" ADD CONSTRAINT "faculty_rank_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "public"."rank"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_rank" ADD CONSTRAINT "faculty_rank_appointment_status_fkey" FOREIGN KEY ("appointment_status") REFERENCES "public"."appointment_status"("appointment_status") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_research" ADD CONSTRAINT "faculty_research_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_research" ADD CONSTRAINT "faculty_research_research_id_fkey" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculty_study_load" ADD CONSTRAINT "faculty_study_load_faculty_academic_semester_id_fkey" FOREIGN KEY ("faculty_academic_semester_id") REFERENCES "public"."faculty_academic_semester"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_info" ADD CONSTRAINT "profile_info_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_info" ADD CONSTRAINT "profile_info_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."role"("role") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_info" ADD CONSTRAINT "profile_info_latest_changelog_id_fkey" FOREIGN KEY ("latest_changelog_id") REFERENCES "public"."changelog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."account_search_view" AS (select "profile"."id", 
            coalesce("profile"."email", '')
            || ' ' || coalesce("profile_info"."role", '')
            || ' ' || coalesce("changelog_sq"."timestamp"::text, '')
            || ' ' || coalesce("changelog_sq"."email", '')
            || ' ' || coalesce("changelog_sq"."operation", '')
         as "search_content" from "profile" left join "profile_info" on "profile_info"."profile_id" = "profile"."id" left join (select "changelog"."id", "changelog"."timestamp", "profile"."email", "changelog"."operation" from "changelog" left join "profile" on "profile"."id" = "changelog"."operator_id") "changelog_sq" on "changelog_sq"."id" = "profile_info"."latest_changelog_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."faculty_record_search_view" AS (
        SELECT
            "faculty"."id" AS id,
            coalesce("faculty"."last_name", '')
                || ' ' || coalesce("faculty"."middle_name", '')
                || ' ' || coalesce("faculty"."first_name", '')
                || ' ' || coalesce("faculty"."suffix", '')
                || ' ' || coalesce("faculty"."birth_date"::text, '')
                || ' ' || coalesce("status"."status", '') 
                || ' ' || coalesce("faculty"."date_of_original_appointment"::text, '')
                AS searchcontent
        FROM "faculty"
            LEFT JOIN "status" ON "faculty"."status" = "status"."status"
        UNION
        SELECT
            "faculty_educational_attainment"."faculty_id" AS id,
            coalesce("faculty_educational_attainment"."degree", '')
                || ' ' || coalesce("faculty_educational_attainment"."institution", '')
                || ' ' || coalesce("faculty_educational_attainment"."graduation_year"::text, '')
                AS searchcontent
        FROM "faculty_educational_attainment"
        UNION
        SELECT
            "faculty_field_of_interest"."faculty_id" AS id,
            coalesce("field_of_interest"."field", '') AS searchcontent
        FROM "faculty_field_of_interest"
            LEFT JOIN "field_of_interest"
                ON "faculty_field_of_interest"."field_of_interest_id" = "field_of_interest"."id"
        UNION
        SELECT
            "faculty_rank"."faculty_id" AS id,
            coalesce("rank"."title", '')
                || ' ' || coalesce("rank"."salary_grade", '')
                || ' ' || coalesce("rank"."salary_rate"::text, '')
                || ' ' || coalesce("faculty_rank"."appointment_status", '')
                || ' ' || coalesce("faculty_rank"."date_of_tenure_or_renewal"::text, '')
                AS searchcontent
        FROM "faculty_rank"
            LEFT JOIN "rank" ON "faculty_rank"."rank_id" = "rank"."id"
        UNION
        SELECT
            "faculty_email"."faculty_id" AS id,
            coalesce("faculty_email"."email", '') AS searchcontent
        FROM "faculty_email"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("admin_position"."title", '')
                || ' ' || coalesce("office"."name", '')
                || ' ' || coalesce("faculty_admin_position"."start_date"::text, '')
                || ' ' || coalesce("faculty_admin_position"."end_date"::text, '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_admin_position"
                ON "faculty_academic_semester"."id" = "faculty_admin_position"."faculty_academic_semester_id"
            LEFT JOIN "admin_position" ON "faculty_admin_position"."admin_position_id" = "admin_position"."id"
            LEFT JOIN "office" ON "faculty_admin_position"."office_id" = "office"."id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("faculty_comm_membership"."membership", '')
                || ' ' || coalesce("faculty_comm_membership"."committee", '')
                || ' ' || coalesce("faculty_comm_membership"."start_date"::text, '')
                || ' ' || coalesce("faculty_comm_membership"."end_date"::text, '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_comm_membership"
                ON "faculty_academic_semester"."id" = "faculty_comm_membership"."faculty_academic_semester_id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("faculty_admin_work"."nature_of_work", '')
                || ' ' || coalesce("office"."name", '')
                || ' ' || coalesce("faculty_admin_work"."start_date"::text, '')
                || ' ' || coalesce("faculty_admin_work"."end_date"::text, '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_admin_work"
                ON "faculty_academic_semester"."id" = "faculty_admin_work"."faculty_academic_semester_id"
            LEFT JOIN "office" ON "faculty_admin_work"."office_id" = "office"."id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("course"."name", '')
                || ' ' || coalesce("faculty_course"."section", '')
                || ' ' || coalesce("faculty_course"."number_of_students"::text, '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_course"
                ON "faculty_academic_semester"."id" = "faculty_course"."faculty_academic_semester_id"
            LEFT JOIN "course" ON "faculty_course"."course_id" = "course"."id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("student"."id"::text, '')
                || ' ' || coalesce("student"."last_name", '')
                || ' ' || coalesce("student"."middle_name", '')
                || ' ' || coalesce("student"."first_name", '')
                || ' ' || coalesce("faculty_mentoring"."category", '')
                || ' ' || coalesce("faculty_mentoring"."start_date"::text, '')
                || ' ' || coalesce("faculty_mentoring"."end_date"::text, '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_mentoring"
                ON "faculty_academic_semester"."id" = "faculty_mentoring"."faculty_academic_semester_id"
            LEFT JOIN "student" ON "faculty_mentoring"."student_id" = "student"."id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("research"."title", '')
                || ' ' || coalesce("research"."start_date"::text, '')
                || ' ' || coalesce("research"."end_date"::text, '')
                || ' ' || coalesce("research"."funding", '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_research"
                ON "faculty_academic_semester"."id" = "faculty_research"."faculty_academic_semester_id"
            LEFT JOIN "research" ON "faculty_research"."research_id" = "research"."id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("faculty_extension"."nature_of_extension", '')
                || ' ' || coalesce("faculty_extension"."agency", '')
                || ' ' || coalesce("faculty_extension"."start_date"::text, '')
                || ' ' || coalesce("faculty_extension"."end_date"::text, '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_extension"
                ON "faculty_academic_semester"."id" = "faculty_extension"."faculty_academic_semester_id"
        UNION
        SELECT
            "faculty_academic_semester"."faculty_id" AS id,
            coalesce("faculty_study_load"."degree_program", '')
                || ' ' || coalesce("faculty_study_load"."university", '')
                AS searchcontent
        FROM "faculty_academic_semester"
            LEFT JOIN "faculty_study_load"
                ON "faculty_academic_semester"."id" = "faculty_study_load"."faculty_academic_semester_id"
    );