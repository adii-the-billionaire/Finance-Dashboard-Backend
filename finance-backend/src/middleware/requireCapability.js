import { capabilitiesFor } from '../constants/roles.js';
import { AppError } from '../errors/AppError.js';

/** @param {'canViewDashboard'|'canListRecords'|'canReadRecordDetail'|'canCreateRecord'|'canUpdateRecord'|'canDeleteRecord'|'canManageUsers'} capability */
export function requireCapability(capability) {
  return (req, _res, next) => {
    try {
      const role = req.authUser?.role;
      if (!role) throw new AppError(401, 'Not authenticated');
      const caps = capabilitiesFor(role);
      if (!caps[capability]) {
        throw new AppError(403, 'Forbidden: insufficient permissions');
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
