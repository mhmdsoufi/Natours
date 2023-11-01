import { Router } from 'express';
import {
  getMe,
  getUser,
  uploadUserPhoto,
  updateMe,
  deleteMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from './../controllers/userController';
import {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} from './../controllers/authController';

const router = Router();

//Auth
router.post('/login', login);
router.get('/logout', logout);
router.post('/signup', signup);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);

//Current User Routes
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

//User CRUD Routes
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//
export default router;
