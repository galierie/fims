import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/server/schema.ts",
  dialect: 'postgresql',
  dbCredentials: {
    user: process.env.USERNAME!,
    password: process.env.PASSWORD!,
    url: process.env.DATABASE_URL!
  }
})
