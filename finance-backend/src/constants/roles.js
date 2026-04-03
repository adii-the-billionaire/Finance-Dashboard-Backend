/** @enum {string} */
export const Role = {
  VIEWER: 'VIEWER',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
};

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const FinancialType = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

/** Which REST/GraphQL capabilities each role has */
export const RoleCapabilities = {
  [Role.VIEWER]: {
    canViewDashboard: true,
    canListRecords: false,
    canReadRecordDetail: false,
    canCreateRecord: false,
    canUpdateRecord: false,
    canDeleteRecord: false,
    canManageUsers: false,
  },
  [Role.ANALYST]: {
    canViewDashboard: true,
    canListRecords: true,
    canReadRecordDetail: true,
    canCreateRecord: false,
    canUpdateRecord: false,
    canDeleteRecord: false,
    canManageUsers: false,
  },
  [Role.ADMIN]: {
    canViewDashboard: true,
    canListRecords: true,
    canReadRecordDetail: true,
    canCreateRecord: true,
    canUpdateRecord: true,
    canDeleteRecord: true,
    canManageUsers: true,
  },
};

export function capabilitiesFor(role) {
  const c = RoleCapabilities[role];
  if (!c) throw new Error(`Unknown role: ${role}`);
  return c;
}
