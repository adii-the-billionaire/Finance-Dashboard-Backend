import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 20000,
  });
  return mongoose.connection;
}
