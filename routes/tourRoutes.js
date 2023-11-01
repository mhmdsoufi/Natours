import { Router } from 'express';
import {
  aliasTopTours,
  getAllTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithIn,
  getDistances,
  createTour,
  getTour,
  uploadTourImages,
  resizeTourImages,
  updateTour,
  deleteTour,
} from './../controllers/tourController';
import { protect, restrictTo } from './../controllers/authController';
import reviewRoutes from './../routes/reviewRoutes';

const router = Router();

// router.param('id', tourController.checkID);
router.use('/:tourId/reviews', reviewRoutes);

//Top 5 and cheap Tours
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

//monthly plan
router
  .route('/tour-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

//Get tour within radius
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getTourWithIn);

//Get distances To all Tours
router.route('/distances/:latlng/unit/:unit').get(getDistances);

//Crud
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

//
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

export default router;
