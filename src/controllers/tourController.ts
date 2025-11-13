import { Request, Response, NextFunction } from 'express';
import type { Express } from 'express';

import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import Tour from '../models/tourModel';
import AppError from '../utils/appError';

import catchAsync from '../utils/catchAsync';
import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory';

export function aliasTopTours(req: Request, res: Response, next: NextFunction) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    (cb as (error: Error | null, acceptFile?: boolean) => void)(
      new AppError('Not an image! Please upload only images.', 400) as AppError,
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourImages = catchAsync(async (req, res, next) => {
  const files = req.files as Record<string, Express.Multer.File[]>;

  if (!files || !files.imageCover || !files.images) return next();

  // imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  const outDir = path.join(__dirname, '../..', 'public', 'img', 'tours');

  await fs.promises.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, req.body.imageCover);

  await sharp(files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(outPath);

  req.body.images = [];

  // images
  await Promise.all(
    files.images.map(async (file: Express.Multer.File, index: number) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await fs.promises.mkdir(outDir, { recursive: true });

      const outPathImage = path.join(outDir, filename);

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(outPathImage);

      req.body.images.push(filename);
    }),
  );

  next();
});

export const getAllTours = getAll(Tour);

export const getTour = getOne(Tour, {
  path: 'reviews',
  select: '-__v',
});

export const createTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (req.body.startLocation && typeof req.body.startLocation.coordinates[0] === 'string') {
    req.body.startLocation.coordinates = req.body.startLocation.coordinates.map(Number);
  }

  return createOne(Tour)(req, res, next);
});

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  res.status(200).json({ status: 'success', data: stats });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);
  res.status(200).json({ status: 'success', results: plan.length, data: plan });
});

export const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? +distance / 3963.19 : +distance / 6378.14;

  if (!lat || !lng)
    return next(new AppError('Please provide latitude and longitude in the form of lat,lng.', 400));

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({ status: 'success', results: tours.length, data: { data: tours } });
});

export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng } = req.params;
  const [lat, lng] = latlng.split(',').map((coord) => parseFloat(coord));
  const { unit } = req.params;

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    return next(new AppError('Please provide latitude and longitude in the form of lat,lng.', 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        spherical: true,
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    unit: unit === 'mi' ? 'miles' : 'kilometers',
    data: { distances },
  });
});
