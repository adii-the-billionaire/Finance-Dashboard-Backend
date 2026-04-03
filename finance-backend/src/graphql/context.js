import { verifyMockToken } from '../utils/mockJwt.js';
import { findActiveUserByIdForAuth } from '../services/user.service.js';

/**
 * @param {{ req: import('express').Request }} arg
 */
export async function createGraphQLContext({ req }) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  let user = null;
  if (token) {
    const payload = verifyMockToken(token);
    if (payload?.sub) {
      user = await findActiveUserByIdForAuth(payload.sub);
    }
  }
  return { user, req };
}
