import { Model as MongooseModel, PopulateOptions } from 'mongoose';
import { Request, Response, NextFunction, RequestHandler } from 'express';

import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures';

export function getAll<T>(Model: MongooseModel<T>): RequestHandler {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({ status: 'success', results: docs.length, data: { data: docs } });
  });
}

export function getOne<T>(
  Model: MongooseModel<T>,
  popOptions?: PopulateOptions | PopulateOptions[],
): RequestHandler {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No document found with taht ID', 404));
    res.status(200).json({ status: 'success', data: { data: doc } });
  });
}

export function createOne<T>(Model: MongooseModel<T>): RequestHandler {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'success', created_at: req.created_at, data: { data: doc } });
  });
}

export function updateOne<T>(Model: MongooseModel<T>): RequestHandler {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No document found with taht ID', 404));

    res.status(200).json({ status: 'success', data: { data: doc } });
  });
}

export function deleteOne<T>(Model: MongooseModel<T>): RequestHandler {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with taht ID', 404));

    res.status(204).json({ status: 'success', data: null });
  });
}
