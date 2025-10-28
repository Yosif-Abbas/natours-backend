import { Document } from 'mongoose';

export type UserRole = 'user' | 'guide' | 'lead-guide' | 'admin';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photo: string;
  password: string;
  passwordConfirm?: string | undefined;
  createdAt: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;

  // Instance methods
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

// For request body types
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdatePasswordData {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirm: string;
}
