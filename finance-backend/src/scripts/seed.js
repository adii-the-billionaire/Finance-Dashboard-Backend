import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { FinancialRecord } from '../models/FinancialRecord.model.js';
import { Role, UserStatus, FinancialType } from '../constants/roles.js';

function describeSeedTarget(uri) {
  if (!uri) return '(no MONGODB_URI)';
  if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
    return 'LOCAL MongoDB — users will NOT appear on Render until you seed with the same MONGODB_URI as Render (Atlas), or run seed in Render Shell.';
  }
  if (uri.startsWith('mongodb+srv://')) {
    const host = uri.split('@')[1]?.split('/')[0] ?? 'unknown';
    return `Atlas / remote host: ${host}`;
  }
  return 'Remote MongoDB (non-SRV)';
}

async function run() {
  console.log('[seed]', describeSeedTarget(env.mongodbUri));
  await mongoose.connect(env.mongodbUri);
  console.log(
    '[seed] Writing to database:',
    mongoose.connection.db?.databaseName ?? '(unknown)'
  );
  console.log(
    '[seed] Render/live must use the SAME DB name in MONGODB_URI (e.g. .../finance_dashboard?...)'
  );
  await User.deleteMany({ email: /@seed\.local$/ });
  await FinancialRecord.deleteMany({ category: 'seed-demo' });

  const admin = await User.create({
    email: 'admin@seed.local',
    displayName: 'Seed Admin',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
  });
  const analyst = await User.create({
    email: 'analyst@seed.local',
    displayName: 'Seed Analyst',
    role: Role.ANALYST,
    status: UserStatus.ACTIVE,
  });
  const viewer = await User.create({
    email: 'viewer@seed.local',
    displayName: 'Seed Viewer',
    role: Role.VIEWER,
    status: UserStatus.ACTIVE,
  });

  const now = new Date();
  await FinancialRecord.insertMany([
    {
      amount: 5000,
      type: FinancialType.INCOME,
      category: 'seed-demo',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      notes: 'Monthly retainer',
      createdBy: admin._id,
    },
    {
      amount: 1200,
      type: FinancialType.EXPENSE,
      category: 'seed-demo',
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      notes: 'Software licenses',
      createdBy: admin._id,
    },
    {
      amount: 800,
      type: FinancialType.INCOME,
      category: 'Consulting',
      date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      notes: 'One-off project',
      createdBy: admin._id,
    },
  ]);

  console.log('Seed users (login with POST /api/v1/auth/login):');
  for (const u of [admin, analyst, viewer]) {
    console.log(`  ${u.email}  role=${u.role}`);
  }
  console.log('Sample financial records created with category seed-demo and Consulting.');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
