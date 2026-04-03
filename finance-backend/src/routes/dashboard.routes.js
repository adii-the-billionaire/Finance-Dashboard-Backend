import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireCapability } from '../middleware/requireCapability.js';
import { validateQuery } from '../middleware/validateRequest.js';
import { dashboardQuerySchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);
r.use(requireCapability('canViewDashboard'));

r.get('/summary', validateQuery(dashboardQuerySchema), dashboardController.summary);

export default r;
