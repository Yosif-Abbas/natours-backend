import mongoose from 'mongoose';
import Tour from './tourModel';
import { IReview, ReviewModel } from '../types/review';

const reviewSchema = new mongoose.Schema<IReview, ReviewModel>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating must be provided!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Ensure one review per user per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId: string) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  const Review = this.constructor as unknown as ReviewModel;

  Review.calcAverageRatings(this.tour as string);
});

reviewSchema.pre(
  /^findOneAnd/,
  async function (this: mongoose.Query<any, any> & { reviewDoc?: IReview }, next) {
    this.reviewDoc = await this.findOne();
    next();
  },
);

reviewSchema.post(
  /^findOneAnd/,
  async function (this: mongoose.Query<any, any> & { reviewDoc?: IReview }) {
    if (this?.reviewDoc) {
      const Review = this.reviewDoc.constructor as unknown as ReviewModel;
      await Review.calcAverageRatings(this.reviewDoc.tour as string);
    }
  },
);

const Review = mongoose.model<IReview, ReviewModel>('Review', reviewSchema);

export default Review;
