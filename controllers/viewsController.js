import Booking from '../models/bookingModel';
import Tour from '../models/tourModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

export function getLoginForm(req, res) {
  res.status(200).render('login', {
    title: 'log into your account',
  });
}

export function getSignUpForm(req, res) {
  res.status(200).render('sign-up', {
    title: 'Registration',
  });
}

export function getAccount(req, res) {
  res.status(200).render('account', {
    title: 'Your account',
  });
}

export const getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour.id);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
