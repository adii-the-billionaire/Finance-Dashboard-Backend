import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireCapability } from '../middleware/requireCapability.js';
import {
  validateBody,
  validateParams,
} from '../middleware/validateRequest.js';
import {
  createUserBodySchema,
  updateUserBodySchema,
  idParamSchema,
} from '../validators/schemas.js';

const r = Router();

r.use(authenticate);
r.use(requireCapability('canManageUsers'));

r.get('/', userController.list);
r.get('/:id', validateParams(idParamSchema), userController.getById);
r.post('/', validateBody(createUserBodySchema), userController.create);
r.patch(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateUserBodySchema),
  userController.update
);

export default r;
