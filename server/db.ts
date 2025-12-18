import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Check your Render Environment Variables.",
  );
}

/**
 * FIXED LOGIC:
 * If the connection string already contains "ssl=true", we let the 
 * connection string handle it. Otherwise, we add the required 
 * Render SSL config object.
 */
const sslConfig = connectionString.includes("ssl=true") 
  ? true 
  : { rejectUnauthorized: false };

export const pool = new Pool({ 
  connectionString,
  ssl: sslConfig
});

export const db = drizzle(pool, { schema });
