import * as authService from '../services/auth.service.js';

export async function login(req, res, next) {
  try {
    const result = await authService.loginMock(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
