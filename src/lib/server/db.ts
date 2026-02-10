import { drizzle } from "drizzle-orm/node-postgres"
import { DATABASE_URL } from "$env/static/private"
import * as schema from "$lib/server/schema"
// for local/dev database, use
// postgresql://(user):(password)@localhost:(port)/(whatever you name the local database)
// within .env file under DATABASE
// you can get the port using psql and doing \conninfo

export const db = drizzle(DATABASE_URL!, {schema});

