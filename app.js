import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';
import bookingRouter from './routes/bookingRoutes';
import viewRouter from './routes/viewRoutes';

//
const __filename = fileURLToPath(import.meta.url);
//
const __dirname = path.dirname(__filename);

//
const app = express();

//Setup Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL middleware

//Serving static file
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP headers
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],

//       fontSrc: ["'self'", 'https:', 'data:'],

//       scriptSrc: ["'self'", 'unsafe-inline'],

//       scriptSrc: ["'self'", 'https://*.cloudflare.com'],

//       scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

//       styleSrc: ["'self'", 'https:', 'unsafe-inline'],

//       connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
//     },
//   })
// );

//
//
// if (!process.env.NODE_ENV == 'production') {
//   console.log('dev');
// }
app.use(morgan('dev'));

//

//LIMIT Request from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from one IP, Please try again in an hour!!',
});
app.use('/api', limiter);

//

// BODY parser, reading date from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
    ],
  })
);

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

/////

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!!`, 404));
});

// res.status(404).json({
//   status: 'fail',
//   message: `Cant find ${req.originalUrl} on this server!!`,
// });
// const err = new Error(`Cant find ${req.originalUrl} on this server!!`);
// err.status = 'fail';
// err.statusCode = 404;

/////

app.use(globalErrorHandler);

/////
export default app;
