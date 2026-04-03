import { FinancialRecord } from '../models/FinancialRecord.model.js';
import { FinancialType } from '../constants/roles.js';

const MS_DAY = 86400000;

/**
 * Dashboard aggregates for all non-deleted records.
 */
export async function getDashboardSummary({ recentLimit = 10, trendGranularity = 'monthly' } = {}) {
  const match = { isDeleted: false };

  const [totalsAgg, byCategory, recent, trendBuckets] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', FinancialType.INCOME] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', FinancialType.EXPENSE] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]),
    FinancialRecord.find(match)
      .sort({ date: -1, createdAt: -1 })
      .limit(Math.min(50, Math.max(1, recentLimit)))
      .select('amount type category date notes createdAt')
      .lean(),
    buildTrendAggregation(match, trendGranularity),
  ]);

  const t = totalsAgg[0] || { totalIncome: 0, totalExpenses: 0, count: 0 };
  const netBalance = (t.totalIncome || 0) - (t.totalExpenses || 0);

  return {
    totals: {
      totalIncome: round2(t.totalIncome),
      totalExpenses: round2(t.totalExpenses),
      netBalance: round2(netBalance),
      recordCount: t.count || 0,
    },
    categoryBreakdown: byCategory.map((row) => ({
      category: row._id.category,
      type: row._id.type,
      total: round2(row.total),
    })),
    recentActivity: recent.map((r) => ({
      id: r._id.toString(),
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: r.date,
      notes: r.notes,
      createdAt: r.createdAt,
    })),
    trends: trendBuckets,
    trendGranularity,
  };
}

async function buildTrendAggregation(match, granularity) {
  const dateTrunc =
    granularity === 'weekly'
      ? {
          $dateToString: {
            format: '%G-W%V',
            date: '$date',
          },
        }
      : {
          $dateToString: {
            format: '%Y-%m',
            date: '$date',
          },
        };

  const rows = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          period: dateTrunc,
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.period': 1 } },
  ]);

  const byPeriod = new Map();
  for (const row of rows) {
    const p = row._id.period;
    if (!byPeriod.has(p)) {
      byPeriod.set(p, { period: p, income: 0, expense: 0 });
    }
    const b = byPeriod.get(p);
    if (row._id.type === FinancialType.INCOME) b.income = row.total;
    if (row._id.type === FinancialType.EXPENSE) b.expense = row.total;
  }

  return [...byPeriod.values()].map((x) => ({
    period: x.period,
    income: round2(x.income),
    expense: round2(x.expense),
    net: round2(x.income - x.expense),
  }));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
