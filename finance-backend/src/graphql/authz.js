import { AppError } from '../errors/AppError.js';
import { capabilitiesFor } from '../constants/roles.js';

function assertAuthed(user) {
  if (!user) throw new AppError(401, 'Unauthorized');
}

/** @param {import('mongoose').Types.ObjectId | { role: string } & Record<string, unknown> | null | undefined} user */
export function requireGraphQLCapability(user, cap) {
  assertAuthed(user);
  const caps = capabilitiesFor(user.role);
  if (!caps[cap]) throw new AppError(403, 'Forbidden: insufficient permissions');
}
