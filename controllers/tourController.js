import AppError from '../utils/appError';
import Tour from './../models/tourModel';
import APIFeatures from './../utils/apiFeatures';
import catchAsync from './../utils/catchAsync';
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from './handlerFactory';
// const sharp = require('sharp');
import multer, { diskStorage } from 'multer';

//
//

//FOR STORAGE photo in public
const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/tours');
  },
  filename: async (req, files, cb) => {
    console.log(files);
    const ext = files.mimetype.split('/')[1];
    const name = await Tour.findById(req.params.id);

    if (files.fieldname === 'imageCover') {
      console.log('imagCCC');
      req.body.imageCover = `tour-${name.slug}--cover.${ext}`;
      cb(null, req.body.imageCover);
    }
    req.files.images.map((file, i) => {
      console.log('imag', i);
      req.body.images = `tour-${name.slug}-${i + 1}.${ext}`;
    });
    cb(null, req.body.images);

    console.log(req.body.images);
  },
});

//FOR STORAGE photo in BUFFER
// const multerStorage1 = multer.memoryStorage();

//Upload Only Photos
const multerFilter = (req, files, cb) => {
  if (files.mimetype.startsWith('image')) {
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

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
export const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  const name = await Tour.findById(req.params.id);
  // const ext = files.mimetype.split('/')[1];

  //2)
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${name.slug}-${i + 1}.jpeg`;

      req.body.images.push(filename);
    })
  );

  //   const buffer = req.files.imageCover[0].buffer;
  //   await buffer.toFile(`public/img/tours/${req.body.imageCover}`);

  //   // await sharp(req.files.imageCover[0].buffer)
  //   //   .resize(2000, 1333)
  //   //   .toFormat('jpeg')
  //   //   .jpeg({ quality: 90 })
  //   //   .toFile(`public/img/tours/${req.body.imageCover}`);

  next();
});
//
//

// //CHECK ID
// exports.checkID = (req, res, next, val) => {
//   console.log(`this is the ID: ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// //CHECK BODY
// exports.CheckBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name Or price',
//     });
//   }
//   next();
// };
//

export function aliasTopTours(req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name price ratingsAverage summary difficulty';
  next();
}

export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, { path: 'reviews' });
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);
export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        tourNum: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'easy' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    // {
    //   $limit: 4,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
export const getTourWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude or longitude in the format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude or longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
