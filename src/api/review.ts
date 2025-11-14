import { Request, Response, NextFunction } from 'express';

import Review from '../models/reviewModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { deleteOne, createOne, getOne, updateOne, getAll } from '../utils/handlerFactory';
import { IUser } from '../types/user';

export const checkTourUserIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user!.id;
  if (!req.body.tour) return next(new AppError('You must provide tour ID', 404));
  next();
};

export const checkUser = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review || !review.user || (review.user as IUser)._id)
    return next(new AppError('Review not Found!', 404));

  if ((review!.user as IUser)._id.toString() !== req.user!.id)
    return next(new AppError("You don't have the permission to do so.", 405));
  next();
});

export const getAllReview = getAll(Review);
export const getReview = getOne(Review);
export const updateReview = updateOne(Review);
export const createReview = createOne(Review);
export const deleteReview = deleteOne(Review);
