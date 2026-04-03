import { verifyMockToken } from '../utils/mockJwt.js';
import { AppError } from '../errors/AppError.js';
import { findActiveUserByIdForAuth } from '../services/user.service.js';

/**
 * Attaches req.authUser — full user doc from DB (lean).
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError(401, 'Missing Authorization bearer token');

    const payload = verifyMockToken(token);
    if (!payload?.sub) throw new AppError(401, 'Invalid or expired token');

    const user = await findActiveUserByIdForAuth(payload.sub);
    if (!user) throw new AppError(401, 'User not found or inactive');

    req.authUser = user;
    req.authPayload = payload;
    next();
  } catch (e) {
    next(e);
  }
}
