import mongoose from 'mongoose';
import { env } from './env.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries help when Atlas IP whitelist updates right after deploy, or cluster is still resuming.
 */
export async function connectDatabase(options = {}) {
  const maxAttempts = options.maxAttempts ?? 5;
  const delayMs = options.delayMs ?? 4000;

  mongoose.set('strictQuery', true);

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: 15000,
      });
      if (attempt > 1) {
        console.log(`MongoDB connected on attempt ${attempt}`);
      }
      console.log(
        `MongoDB connected (database: ${mongoose.connection.db?.databaseName ?? '?'})`
      );
      return mongoose.connection;
    } catch (err) {
      lastErr = err;
      console.error(
        `MongoDB connect attempt ${attempt}/${maxAttempts} failed:`,
        err.message
      );
      if (attempt < maxAttempts) {
        await mongoose.disconnect().catch(() => {});
        await sleep(delayMs);
      }
    }
  }
  throw lastErr;
}
