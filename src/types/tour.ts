import { Document } from 'mongoose';
import { IUser } from './user';

export type tourDifficulty = 'easy' | 'medium' | 'difficult';
export type coordinates = [number, number];

export interface ITour extends Document {
  _id: string;
  name: string;
  duration: number;
  rating: number;
  maxGroupSize: number;
  difficulty: tourDifficulty;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  createdAt: Date;
  startDates?: Date[];
  secretTour: boolean;
  slug: string;

  startLocation?: {
    type: string;
    coordinates: coordinates;
    description: string;
    address: string;
  };

  locations?: {
    type: string;
    coordinates: coordinates;
    description: string;
    address: string;
    day: number;
  }[];

  guides?: string[] | IUser[];
}
