import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

const pool = new Pool({
  connectionString: 'postgres://admin:password123@localhost:5432/task_tracker',
});

export const db = drizzle(pool, { schema });