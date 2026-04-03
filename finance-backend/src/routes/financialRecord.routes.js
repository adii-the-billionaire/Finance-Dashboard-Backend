import { Router } from 'express';
import * as recordController from '../controllers/financialRecord.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireCapability } from '../middleware/requireCapability.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validateRequest.js';
import {
  financialRecordBodySchema,
  financialRecordUpdateBodySchema,
  listRecordsQuerySchema,
  idParamSchema,
} from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get(
  '/',
  requireCapability('canListRecords'),
  validateQuery(listRecordsQuerySchema),
  recordController.list
);
r.get(
  '/:id',
  requireCapability('canReadRecordDetail'),
  validateParams(idParamSchema),
  recordController.getById
);
r.post(
  '/',
  requireCapability('canCreateRecord'),
  validateBody(financialRecordBodySchema),
  recordController.create
);
r.patch(
  '/:id',
  requireCapability('canUpdateRecord'),
  validateParams(idParamSchema),
  validateBody(financialRecordUpdateBodySchema),
  recordController.update
);
r.delete(
  '/:id',
  requireCapability('canDeleteRecord'),
  validateParams(idParamSchema),
  recordController.remove
);

export default r;
