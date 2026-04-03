import { z } from 'zod';
import { Role, UserStatus, FinancialType } from '../constants/roles.js';

export const loginBodySchema = z.object({
  email: z.string().email(),
});

export const createUserBodySchema = z.object({
  email: z.string().email(),
  displayName: z.string().trim().max(200).optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const updateUserBodySchema = z.object({
  displayName: z.string().trim().max(200).optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const financialRecordBodySchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(FinancialType),
  category: z.string().trim().min(1).max(100),
  date: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
});

export const financialRecordUpdateBodySchema = financialRecordBodySchema.partial();

export const listRecordsQuerySchema = z.object({
  type: z.nativeEnum(FinancialType).optional(),
  category: z.string().trim().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const dashboardQuerySchema = z.object({
  recentLimit: z.coerce.number().int().min(1).max(50).optional(),
  trendGranularity: z.enum(['weekly', 'monthly']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id'),
});

export function parseOrThrow(schema, data) {
  const r = schema.safeParse(data);
  if (!r.success) {
    const err = new Error('Validation failed');
    err.name = 'ZodError';
    err.issues = r.error.issues;
    throw err;
  }
  return r.data;
}
