import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function parsePort() {
  const raw = process.env.PORT;
  if (raw !== undefined && raw !== '') {
    const n = parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 4000;
}

export const env = {
  port: parsePort(),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/finance_dashboard'),
  mockJwtSecret: required('MOCK_JWT_SECRET', 'dev-only-secret-change-in-production'),
};
