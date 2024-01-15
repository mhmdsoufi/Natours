import mongoose from 'mongoose';
import dotenv from 'dotenv';

//Uncaught Exception ERROR
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, err.stack);
  console.log('Uncaught Exception Shutting down...');
  // process.exit(1);
});
//

import app from './app.js ';

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log('DB connection is successful'));

//SERVER
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
/////

//Unhandled Rejection ERROR
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection Shutting down...');
  // server.close(() => {
  //   // process.exit(1);
  // });
});
