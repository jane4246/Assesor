import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Add this block below
  ssl: {
    rejectUnauthorized: false, // Required for connecting to Render Postgres from "outside" or across regions
  }
});

export const db = drizzle(pool, { schema });
