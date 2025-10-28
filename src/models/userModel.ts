import crypto from 'crypto';
import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
import validator from 'validator';

import { IUser } from '../types/user';

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'You must have a name'],
    trim: true,
    maxLength: [40, 'A name must have less than 40 characters'],
    minLength: [2, 'A name must have more than 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    validate: [validator.isEmail, 'Invalid Email'],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },

  photo: { type: String, default: 'default.jpg' },

  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
    validate: {
      validator: function (v: string) {
        // At least 8 chars, 1 lowercase, 1 uppercase, 1 number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
      },
      message:
        'Password must be at least 8 characters and include uppercase, lowercase, and a number',
    },
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (value: string) {
        return value === this.password;
      },
      message: 'Passwords do not match',
    },
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  if (this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.pre('save', async function (next) {
  next();
});

userSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async (candidatePassword: string, userPassword: string) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
