import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Force a check and log the connection attempt
const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("undefined")) {
  console.error("❌ DATABASE_URL is invalid or undefined!");
  throw new Error("Check Render Environment Variables: DATABASE_URL is missing.");
}

// Log a masked version to debug the format in Render logs
const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":****@");
console.log(`Connecting to database: ${maskedUrl.split('@')[1]}`);

export const pool = new Pool({ 
  connectionString: connectionString.trim(), // Remove any accidental hidden spaces
  ssl: connectionString.includes("sslmode=require") || connectionString.includes("ssl=true")
    ? { rejectUnauthorized: false }
    : false
});

export const db = drizzle(pool, { schema });
