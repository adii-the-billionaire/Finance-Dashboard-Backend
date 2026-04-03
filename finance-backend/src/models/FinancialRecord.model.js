import mongoose from 'mongoose';
import { FinancialType } from '../constants/roles.js';

const financialRecordSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: Object.values(FinancialType),
      required: true,
    },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ type: 1 });
financialRecordSchema.index({ isDeleted: 1 });

export const FinancialRecord =
  mongoose.models.FinancialRecord ||
  mongoose.model('FinancialRecord', financialRecordSchema);
