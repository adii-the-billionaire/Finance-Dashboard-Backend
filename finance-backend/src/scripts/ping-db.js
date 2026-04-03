/**
 * Verifies MONGODB_URI (local or Atlas) using Mongoose — same stack as the API.
 * Usage: set MONGODB_URI in .env, then: npm run ping-db
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log('Ping OK — database reachable.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
