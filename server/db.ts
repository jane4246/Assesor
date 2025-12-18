import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { URL } from "url"; // Import native URL parser

const { Pool } = pg;

// Use the URL you provided (ensure it's in your Render Env Vars)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing! Make sure it's set in Render Environment.");
}

// Manually parse to ensure it's valid
try {
  const dbUrl = new URL(connectionString);
  console.log(`📡 Database connection initialized for host: ${dbUrl.hostname}`);
} catch (e) {
  console.error("❌ The DATABASE_URL is not a valid format!");
}

export const pool = new Pool({ 
  connectionString: connectionString,
  // Force SSL for Render internal/external connections
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });
