import AppError from '../utils/appError';

// HANDEL ERROR FOR
const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}= ${err.value}.`;
  return new AppError(message, 400);
};

// HANDEL ERROR FOR not using the same name
const handelDuplicateFieldsDB = (err) => {
  // //use expression for extract value between quotes
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  ////
  //use keyValue.name
  // const value = err.keyValue.name;
  //
  const message = `Duplicate field value:${value}. Please use another value!!`;
  return new AppError(message, 400);
};

// HANDEL ERROR FOR Invalid token
const handelJWTError = () =>
  new AppError('Invalid token!! Please log in again..', 401);

// HANDEL ERROR FOR Expired token
const handelJWTExpiredError = () =>
  new AppError('Your token has expired!! Please log in again..', 401);

//HANDEL ERROR FOR
const handelValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. \n');
  const message = `Invalid input data:${errors}`;
  return new AppError(message, 400);
};

// How to Show Error in dev mode
const sendDevError = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR', err.code);

    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    // process.exit(1);
  }

  //RENDERED WEB
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!!',
    msg: err.message,
  });
};

// How to Show Error in prod mode
const sendProdError = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error
    if (err.isOperational) {
      console.error('ERROR', err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming or other unknown error

    // 1)Log error
    console.error('ERROR', err);
    // 2)Send generic message
    return res.status('500').json({
      status: 'error',
      message: 'Something went very wrong!!',
    });
  }

  //B) RENDERED WEB
  //Operational, trusted error
  if (err.isOperational) {
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!!',
      msg: err.message,
    });
  }
  //Programming or other unknown error

  // 1)Log error
  console.error('ERROR', err);
  // 2)Send generic message
  //RENDERED WEB
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!!',
    msg: 'Please try again later!!',
  });
};

// exports the functions
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // dev mode
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  }
  // prod mode
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    //
    if (error.name === 'CastError') error = handelCastErrorDB(error);
    //
    if (error.code === 11000) error = handelDuplicateFieldsDB(error);
    //
    if (error.name === 'ValidationError')
      error = handelValidationErrorDB(error);
    //
    if (error._message === 'Validation failed')
      error = handelValidationErrorDB(error);
    //
    if (error.name === 'JsonWebTokenError') error = handelJWTError();
    //
    if (error.name === 'TokenExpiredError') error = handelJWTExpiredError();
    //
    sendProdError(error, req, res);
  }
};
