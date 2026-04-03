import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';
import { FinancialRecord } from '../models/FinancialRecord.model.js';

const defaultPage = 1;
const defaultLimit = 20;
const maxLimit = 100;

/**
 * @param {{
 *   type?: string,
 *   category?: string,
 *   dateFrom?: Date,
 *   dateTo?: Date,
 *   page?: number,
 *   limit?: number,
 * }} query
 */
export async function listRecords(query) {
  const filter = { isDeleted: false };
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = new RegExp(`^${escapeRegex(query.category)}$`, 'i');
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = query.dateFrom;
    if (query.dateTo) filter.date.$lte = query.dateTo;
  }

  const page = Math.max(1, Number(query.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    FinancialRecord.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'email displayName')
      .lean(),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeRecord),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getRecordById(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid record id');
  const doc = await FinancialRecord.findOne({ _id: id, isDeleted: false })
    .populate('createdBy', 'email displayName')
    .lean();
  if (!doc) throw new AppError(404, 'Record not found');
  return serializeRecord(doc);
}

export async function createRecord(payload, createdByUserId) {
  const doc = await FinancialRecord.create({
    amount: payload.amount,
    type: payload.type,
    category: payload.category,
    date: payload.date,
    notes: payload.notes ?? '',
    createdBy: createdByUserId,
  });
  await doc.populate('createdBy', 'email displayName');
  return serializeRecord(doc.toObject());
}

export async function updateRecord(id, payload) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid record id');
  const doc = await FinancialRecord.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError(404, 'Record not found');

  const { amount, type, category, date, notes } = payload;
  if (amount !== undefined) doc.amount = amount;
  if (type !== undefined) doc.type = type;
  if (category !== undefined) doc.category = category;
  if (date !== undefined) doc.date = date;
  if (notes !== undefined) doc.notes = notes;

  await doc.save();
  await doc.populate('createdBy', 'email displayName');
  return serializeRecord(doc.toObject());
}

export async function softDeleteRecord(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid record id');
  const doc = await FinancialRecord.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new AppError(404, 'Record not found');
  doc.isDeleted = true;
  doc.deletedAt = new Date();
  await doc.save();
  return { id: doc._id.toString(), deleted: true };
}

function serializeRecord(doc) {
  const createdBy = doc.createdBy
    ? {
        id: doc.createdBy._id?.toString?.() ?? String(doc.createdBy),
        email: doc.createdBy.email,
        displayName: doc.createdBy.displayName,
      }
    : null;
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    type: doc.type,
    category: doc.category,
    date: doc.date,
    notes: doc.notes,
    createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
