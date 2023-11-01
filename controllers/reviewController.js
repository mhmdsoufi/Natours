import AppError from './../utils/appError';
import catchAsync from './../utils/catchAsync';
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from './handlerFactory';
import Review from './../models/reviewModel';

//Set Tour and User Ids for Creating a review
export function setTourUserIds(req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
}

export const getAllReviews = getAll(Review);

export const getReview = getOne(Review);

export const createReview = createOne(Review);

export const updateReview = updateOne(Review);

export const deleteReview = deleteOne(Review);
