import 'express-serve-static-core';
import { IUser } from '../user';

declare module 'express-serve-static-core' {
  interface Request {
    created_at?: string;
    user?: IUser;
  }
}
