import { Router } from 'express';
import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
  getAccount,
  getMyTours,
} from './../controllers/viewsController';
import { isLoggedIn, protect } from './../controllers/authController';
import { createBookingCheckout } from './../controllers/bookingController';

const router = Router();

router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/sign-up', isLoggedIn, getSignUpForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

export default router;
