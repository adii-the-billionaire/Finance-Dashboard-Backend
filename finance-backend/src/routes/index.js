import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import financialRecordRoutes from './financialRecord.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const api = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

api.use('/auth', loginLimiter, authRoutes);
api.use('/users', userRoutes);
api.use('/records', financialRecordRoutes);
api.use('/dashboard', dashboardRoutes);

export default api;
