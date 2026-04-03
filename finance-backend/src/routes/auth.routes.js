import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validateRequest.js';
import { loginBodySchema } from '../validators/schemas.js';

const r = Router();

r.post('/login', validateBody(loginBodySchema), authController.login);

export default r;
