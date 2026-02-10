import { drizzle } from "drizzle-orm/neon-http"
import { DATABASE_URL } from "$env/static/private"
import * as schema from "$lib/server/schema"
import { neon } from "@neondatabase/serverless";
// for local/dev database, use
// postgresql://(user):(password)@localhost:(port)/(whatever you name the local database)
// within .env file under DATABASE
// you can get the port using psql and doing \conninfo

const sql = neon(DATABASE_URL!);
export const db = drizzle(sql, {schema});

