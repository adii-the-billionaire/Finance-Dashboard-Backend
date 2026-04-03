import { parseOrThrow } from '../validators/schemas.js';

export function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.body = parseOrThrow(schema, req.body);
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    try {
      req.query = parseOrThrow(schema, req.query);
      next();
    } catch (e) {
      next(e);
    }
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    try {
      req.params = parseOrThrow(schema, req.params);
      next();
    } catch (e) {
      next(e);
    }
  };
}
