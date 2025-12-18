import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// 1. Get the URL and strip any accidental quotes or spaces
const dbUrl = process.env.DATABASE_URL?.trim();

if (!dbUrl) {
  throw new Error("DATABASE_URL is missing. Check Render Environment Variables.");
}

// 2. Extract the base URL and the SSL requirement
// This prevents the 'searchParams' crash by manually handling the string
const hasSslParams = dbUrl.includes("ssl=true") || dbUrl.includes("sslmode=require");

export const pool = new Pool({ 
  connectionString: dbUrl,
  // If the URL already has SSL params, we let it be. 
  // If not, we explicitly set it for Render.
  ssl: hasSslParams ? { rejectUnauthorized: false } : false
});

// 3. Add an error listener to the pool to catch connection issues early
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export const db = drizzle(pool, { schema });
