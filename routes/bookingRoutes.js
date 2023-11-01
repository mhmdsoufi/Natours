import { Router } from 'express';
import {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController';
import { protect, restrictTo } from '../controllers/authController';

const router = Router();

router.use(protect);

//
router.get('/checkout-session/:tourId', getCheckoutSession);
//

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

export default router;
