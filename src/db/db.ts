import { drizzle } from "drizzle-orm/neon-http";
import * as entities from "@/db/entities";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("[ERROR]: DATABASE_URL missing");
  process.exit(1);
}

export const client = neon(connectionString);

try {
  await client`SELECT 1`;
  console.info("[INFO]: Database connection established successfully.");
} catch (error) {
  console.error(
    "[ERROR]: Failed to connect to the database. ",
    error instanceof Error ? error.message : "",
  );
  process.exit(1);
}

export const db = drizzle(client, { schema: { ...entities } });

export type Database = typeof db;
