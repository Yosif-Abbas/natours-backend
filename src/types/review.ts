import { Model } from 'mongoose';
import { ITour } from './tour';
import { IUser } from './user';

export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  user?: IUser | string;
  tour?: ITour | string;
  reviewDoc?: IReview;
}

export interface ReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: string): Promise<void>;
}
