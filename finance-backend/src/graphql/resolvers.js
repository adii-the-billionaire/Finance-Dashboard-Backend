import * as authService from '../services/auth.service.js';
import * as userService from '../services/user.service.js';
import * as recordService from '../services/financialRecord.service.js';
import * as dashboardService from '../services/dashboard.service.js';
import { requireGraphQLCapability } from './authz.js';
import {
  loginBodySchema,
  createUserBodySchema,
  updateUserBodySchema,
  financialRecordBodySchema,
  financialRecordUpdateBodySchema,
  listRecordsQuerySchema,
  dashboardQuerySchema,
} from '../validators/schemas.js';
function toUser(u) {
  if (!u) return null;
  const id = u._id != null ? u._id.toString() : u.id;
  return {
    id,
    email: u.email,
    displayName: u.displayName ?? '',
    role: u.role,
    status: u.status,
    createdAt:
      u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt ?? ''),
    updatedAt:
      u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt ?? ''),
  };
}

function toRecord(r) {
  return {
    ...r,
    date: r.date instanceof Date ? r.date.toISOString() : r.date,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

export const resolvers = {
  Query: {
    me(_p, _a, ctx) {
      return toUser(ctx.user);
    },
    async users(_p, _a, ctx) {
      requireGraphQLCapability(ctx.user, 'canManageUsers');
      const users = await userService.listUsers();
      return users.map(toUser);
    },
    async user(_p, { id }, ctx) {
      requireGraphQLCapability(ctx.user, 'canManageUsers');
      const u = await userService.getUserById(id);
      return toUser(u);
    },
    async financialRecords(_p, { filter }, ctx) {
      requireGraphQLCapability(ctx.user, 'canListRecords');
      const q = filter || {};
      const parsed = listRecordsQuerySchema.parse({
        type: q.type,
        category: q.category,
        dateFrom: q.dateFrom,
        dateTo: q.dateTo,
        page: q.page,
        limit: q.limit,
      });
      const page = await recordService.listRecords(parsed);
      return {
        ...page,
        items: page.items.map(toRecord),
      };
    },
    async financialRecord(_p, { id }, ctx) {
      requireGraphQLCapability(ctx.user, 'canReadRecordDetail');
      const r = await recordService.getRecordById(id);
      return toRecord(r);
    },
    async dashboardSummary(_p, { input }, ctx) {
      requireGraphQLCapability(ctx.user, 'canViewDashboard');
      const raw = input || {};
      const q = dashboardQuerySchema.parse({
        recentLimit: raw.recentLimit,
        trendGranularity: raw.trendGranularity,
      });
      const d = await dashboardService.getDashboardSummary(q);
      return {
        ...d,
        recentActivity: d.recentActivity.map((x) => ({
          ...x,
          date: x.date instanceof Date ? x.date.toISOString() : x.date,
          createdAt:
            x.createdAt instanceof Date ? x.createdAt.toISOString() : x.createdAt,
        })),
      };
    },
  },
  Mutation: {
    async login(_p, { input }) {
      const body = loginBodySchema.parse(input);
      const result = await authService.loginMock(body);
      return {
        token: result.token,
        user: toUser(result.user),
      };
    },
    async createUser(_p, { input }, ctx) {
      requireGraphQLCapability(ctx.user, 'canManageUsers');
      const body = createUserBodySchema.parse(input);
      const u = await userService.createUser(body);
      return toUser(u);
    },
    async updateUser(_p, { id, input }, ctx) {
      requireGraphQLCapability(ctx.user, 'canManageUsers');
      const body = updateUserBodySchema.parse(input);
      const u = await userService.updateUser(id, body);
      return toUser(u);
    },
    async createFinancialRecord(_p, { input }, ctx) {
      requireGraphQLCapability(ctx.user, 'canCreateRecord');
      const body = financialRecordBodySchema.parse({
        ...input,
        date: new Date(input.date),
      });
      const r = await recordService.createRecord(body, ctx.user._id);
      return toRecord(r);
    },
    async updateFinancialRecord(_p, { id, input }, ctx) {
      requireGraphQLCapability(ctx.user, 'canUpdateRecord');
      const parsed = financialRecordUpdateBodySchema.parse({
        ...input,
        date: input.date != null ? new Date(input.date) : undefined,
      });
      const r = await recordService.updateRecord(id, parsed);
      return toRecord(r);
    },
    async deleteFinancialRecord(_p, { id }, ctx) {
      requireGraphQLCapability(ctx.user, 'canDeleteRecord');
      return recordService.softDeleteRecord(id);
    },
  },
};
