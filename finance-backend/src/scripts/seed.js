import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { FinancialRecord } from '../models/FinancialRecord.model.js';
import { Role, UserStatus, FinancialType } from '../constants/roles.js';

async function run() {
  await mongoose.connect(env.mongodbUri);
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
