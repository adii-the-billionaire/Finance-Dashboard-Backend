import { AppError } from '../errors/AppError.js';
import { User } from '../models/User.model.js';
import { UserStatus } from '../constants/roles.js';
import { signMockToken } from '../utils/mockJwt.js';

export async function loginMock({ email }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new AppError(401, 'Invalid credentials');
  if (user.status !== UserStatus.ACTIVE) throw new AppError(403, 'User is inactive');

  const token = signMockToken({ sub: user._id.toString(), role: user.role });
  const plain = user.toObject ? user.toObject() : user;
  return {
    token,
    user: {
      id: plain._id.toString(),
      email: plain.email,
      displayName: plain.displayName,
      role: plain.role,
      status: plain.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    },
  };
}
