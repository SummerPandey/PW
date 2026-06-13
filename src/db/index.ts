import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// postgres-js does not open a connection until the first query, so creating the
// client at import time is cheap. A placeholder URL keeps `next build` working
// when DATABASE_URL is unset; the real value is used at runtime (e.g. on Vercel).
const connectionString =
  process.env.DATABASE_URL ?? "postgres://user:pass@localhost:5432/postgres";

// `prepare: false` is required when using Supabase's transaction pooler (pgBouncer).
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
