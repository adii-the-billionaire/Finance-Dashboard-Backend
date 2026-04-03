import * as recordService from '../services/financialRecord.service.js';

export async function list(req, res, next) {
  try {
    const result = await recordService.listRecords(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await recordService.getRecordById(req.params.id);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const item = await recordService.createRecord(req.body, req.authUser._id);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const item = await recordService.updateRecord(req.params.id, req.body);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await recordService.softDeleteRecord(req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
