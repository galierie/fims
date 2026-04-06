DROP MATERIALIZED VIEW "public"."faculty_record_search_view";--> statement-breakpoint
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
                || ' ' || coalesce("faculty_mentoring"."remarks", '')
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