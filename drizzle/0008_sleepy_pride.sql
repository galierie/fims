-- Custom SQL migration file, put your code below! --
CREATE INDEX "account_search_gin_idx" ON "public"."account_search_view" USING GIN (to_tsvector('english', "search_content"));
CREATE INDEX "faculty_record_search_gin_idx" ON "public"."faculty_record_search_view" USING GIN (to_tsvector('english', "searchcontent"));