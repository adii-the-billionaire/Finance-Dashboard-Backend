import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';
import { User } from '../models/User.model.js';
import { Role, UserStatus } from '../constants/roles.js';

export async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map(serializeUser);
}

export async function getUserById(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid user id');
  const user = await User.findById(id).lean();
  if (!user) throw new AppError(404, 'User not found');
  return serializeUser(user);
}

export async function createUser({ email, displayName, role, status }) {
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) throw new AppError(409, 'Email already registered');

  const user = await User.create({
    email: email.toLowerCase().trim(),
    displayName: displayName ?? '',
    role: role ?? Role.VIEWER,
    status: status ?? UserStatus.ACTIVE,
  });
  return serializeUser(user.toObject());
}

export async function updateUser(id, { displayName, role, status }) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid user id');
  const user = await User.findById(id);
  if (!user) throw new AppError(404, 'User not found');

  if (displayName !== undefined) user.displayName = displayName;
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;

  await user.save();
  return serializeUser(user.toObject());
}

export async function findActiveUserByIdForAuth(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findOne({ _id: id, status: UserStatus.ACTIVE }).lean();
}

function serializeUser(doc) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
