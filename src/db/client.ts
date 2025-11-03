import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Load environment variables for standalone scripts
if (typeof window === 'undefined' && !process.env.VERCEL) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
