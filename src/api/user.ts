import type { Request, Response, NextFunction, Express } from 'express';

import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { deleteOne, updateOne, getOne, getAll } from '../utils/handlerFactory';

function filterObj(obj: Record<string, string>, ...allowedFields: Array<string>) {
  const newObj: Record<string, string | number | boolean | Array<string>> = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

export function getMe(req: Request, res: Response, next: NextFunction) {
  req.params.id = req.user!.id;
  next();
}

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    (cb as (error: Error | null, acceptFile?: boolean) => void)(
      new AppError('Not an image. Please upload only images.', 400) as AppError,
      false,
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user!.id}-${Date.now()}.jpeg`;

  // ensure output dir exists
  const outDir = path.join(__dirname, '../..', 'public', 'img', 'users');
  await fs.promises.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, req.file.filename);

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(outPath);

  next();
});

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword.', 400),
    );

  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user!.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user } });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user!.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined please use /signup instead!.',
  });
};

// can't update password using updateUser
export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User);
