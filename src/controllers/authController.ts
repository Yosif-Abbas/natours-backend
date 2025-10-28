import { NextFunction, Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import User from '../models/userModel';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Email from '../utils/email';
import {
  IUser,
  CreateUserData,
  LoginData,
  UpdatePasswordData,
  ForgotPasswordData,
} from '../types/user';
import { verifyToken, signAccessToken, signRefreshToken } from '../utils/jwt';

import config from '../config/envValidation';

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  res.cookie('refresh_jwt', refreshToken, {
    maxAge: Number(config.jwt.cookieExpiresIn) * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict',
    secure: config.env === 'production',
  });

  const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;

  res
    .status(statusCode)
    .json({ status: 'success', token: accessToken, data: { user: userWithoutPassword } });
};

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token = '';
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.access_jwt) token = req.cookies.access_jwt;

  if (!token)
    return next(new AppError('You are not logged in!, please log in to get access.', 401));

  const decoded = await verifyToken(token, config.jwt.accessSecret);

  if (!decoded) {
    return next(new AppError('Invalid token', 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError("The user belonging to this token doesn't exist.", 401));

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('User recently changed password, Please log in again!', 401));

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies.access_jwt) {
    try {
      const decoded = await verifyToken(req.cookies.access_jwt, config.jwt.accessSecret);

      if (!decoded) return next();

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      res.locals.user = currentUser;
    } catch (err) {
      return next(err);
    }
  }
  next();
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return next(new AppError('You do not have the permission to perform this action.', 403));
    }
    next();
  };
};

export const refreshAccessToken = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const refreshToken = req.cookies.refresh_jwt;
  if (!refreshToken) return next(new AppError('No refresh token provided', 401));

  const decoded = await verifyToken(refreshToken, config.jwt.refreshSecret);

  const user = await User.findById(decoded!.id).select('-password');

  if (!user) return next(new AppError('User no longer exists', 404));

  const accessToken = signAccessToken(user._id);

  res.status(200).json({ status: 'success', token: accessToken, user });
});

export const signup = catchAsync(
  async (req: Request<unknown, unknown, CreateUserData>, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, role } = req.body;
    const newUser: HydratedDocument<IUser> = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
    });

    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
  },
);

export const login = catchAsync(
  async (req: Request<unknown, unknown, LoginData>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password!)))
      return next(new AppError('Incorrect email or password', 401));

    createSendToken(user, 200, res);
  },
);

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const cookieOptions = {
    maxAge: 1000,
    httpOnly: true,
    expires: new Date(0),
  };
  res.cookie('refresh_jwt', '', cookieOptions);
  res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
});

export const forgotPassword = catchAsync(
  async (req: Request<unknown, unknown, ForgotPasswordData>, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new AppError('There is no user with this email address.', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/vi/users/resetPassword/${resetToken}`;

    try {
      await new Email(user, resetURL).sendResetPassword();

      res.status(200).json({ status: 'success', message: 'Token sent to email' });
    } catch {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
  },
);

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired.', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  createSendToken(user, 201, res);
});

export const updatePassword = catchAsync(
  async (req: Request<unknown, unknown, UpdatePasswordData>, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!.id).select('+password');

    if (!user) return next(new AppError('Unauthorized!', 401));

    // if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    if (!(await bcrypt.compare(req.body.passwordCurrent, user.password)))
      return next(new AppError('Wrong password, Please try again!.', 401));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordChangedAt = new Date();
    await user.save();

    createSendToken(user, 200, res);
  },
);
