import mongoose from 'mongoose';
import Tour from './tourModel';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!!'],
    },
    //
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    //
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },

    //
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name , photo',
  });

  next();
});

//
reviewSchema.statics.calcAverageRatings = async function (tourId) {
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

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//one review on tour from the same user
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

//calculate and set averageRatings and ratingsQuantity for Tour when create new review
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

//
//get the review that was updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.up = await this.findOne();

  next();
});

//calculate and set averageRatings and ratingsQuantity for Tour when update or delete a review
reviewSchema.post(/^findOneAnd/, async function () {
  await this.up.constructor.calcAverageRatings(this.up.tour);
});

//
const Review = mongoose.model('Review', reviewSchema);

export default Review;
