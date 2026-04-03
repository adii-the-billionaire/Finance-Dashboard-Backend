import * as dashboardService from '../services/dashboard.service.js';

export async function summary(req, res, next) {
  try {
    const data = await dashboardService.getDashboardSummary(req.query);
    res.json(data);
  } catch (e) {
    next(e);
  }
}
