import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const connectionString = process.env.DATABASE_URL!;

// Debug database connection
console.log('🔍 Database URL:', connectionString ? 'Found' : 'Missing');
if (connectionString) {
  console.log('🔗 Full DATABASE_URL:', connectionString);
  const urlParts = connectionString.split('@');
  if (urlParts.length > 1) {
    const userPart = urlParts[0].split('://')[1];
    const username = userPart.split(':')[0];
    console.log('👤 Database user:', username);
    console.log('🌐 Database host:', urlParts[1].split('/')[0]);
  }
}

// Create the connection
const client = postgres(connectionString);

// Create the database instance
const db = drizzle(client, { schema });

// Export schema for use in other files
export { db, schema };