//USERS
import User from '../models/userModel';
// const sharp = require('sharp');
import multer, { diskStorage } from 'multer';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { getAll, getOne, updateOne, deleteOne } from './handlerFactory';

//
//FOR STORAGE photo in public
const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const name = req.user.slug;
    cb(null, `user-${name}-${Date.now()}.${ext}`);
  },
});

//FOR STORAGE photo in BUFFER
// const multerStorage = multer.memoryStorage();

//Upload Only Photos
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

//
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

//RESIZE the Photo

// exports.resizeUserPhoto = (req, res, next) => {
//   if (!req.file) return next();

//   const name = req.user.slug;
//   req.file.filename = `user-${name}-${Date.now()}.jpeg`;

//   sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`);
// };

//

//function for filter fields names that are allowed to be update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

//CREATE USER
export function createUser(req, res) {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined!! Please use /signup',
  });
}

export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User);

////

//Get Me
export function getMe(req, res, next) {
  req.params.id = req.user.id;
  next();
}

export const updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  // 1) Create error if user POSTs password date
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are allowed to be update
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(201).json({
    status: 'success',
    data: null,
  });
});
/////
