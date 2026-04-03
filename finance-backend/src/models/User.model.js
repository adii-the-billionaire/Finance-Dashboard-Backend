import mongoose from 'mongoose';
import { Role, UserStatus } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: { type: String, trim: true, default: '' },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.VIEWER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
      default: UserStatus.ACTIVE,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
