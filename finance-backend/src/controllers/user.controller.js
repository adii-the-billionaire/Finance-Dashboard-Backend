import * as userService from '../services/user.service.js';

export async function list(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json({ users });
  } catch (e) {
    next(e);
  }
}

export async function getById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
}
