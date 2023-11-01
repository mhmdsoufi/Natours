import Stripe from 'stripe';
import Booking from '../models/bookingModel';
import Tour from '../models/tourModel';
import catchAsync from './../utils/catchAsync';
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from './handlerFactory';

//
const stripe = Stripe(
  'sk_test_51O7ZF7GCR7hQJ79Ce6kKnxCHK6BRkRqmsSrSO0eOXh47DqV8F7vZ4MFahsumF0tebIQQrMavktHqGzL7XOS9ebBj00l8daJfkE'
);

//
export const getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2) Create checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        // name: `${tour.name} Tour`,
        // description: tour.summary,
        // images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        // amount: tour.price * 100,
        // currency: 'usd',
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        // customer_data: {
        //   email: req.user.email,
        //   name: req.user.name,
        // },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  //3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

//
export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  console.log('1');
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  console.log('2');

  res.redirect(req.originalUrl.split('?')[0]);
});

//
export const getAllBookings = getAll(Booking);
export const createBooking = createOne(Booking);
export const getBooking = getOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
